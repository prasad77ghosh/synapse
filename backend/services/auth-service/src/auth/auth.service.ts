import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto, RegisterType } from './dto/register.dto';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import {
  CreateUserRequest,
  EmailVerifyRequest,
  RegisterType as ProtoRegisterType,
  UserExistanceRequest,
  UserExistanceStatus,
} from 'src/proto/user.pb';
import {
  comparePassword,
  generateVerificationToken,
  hashPassword,
} from 'src/utils/hash.utils';
import { KafkaService } from 'src/kafka/kafka.service';
import {
  KAFKA_TOPICS,
  UserRegisteredEvent,
} from '@synapse/shared/dist/kafka-config/src';
import { RedisService } from 'src/redis/redis.service';
import { VerifyDto } from './dto/verify.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { TokenRotationDto } from './dto/token-rotation.dto';
import { LogoutDto } from './dto/logout.dto';
import { KongService } from 'src/kong/kong.service';

interface UsersService {
  CreateUser(data: CreateUserRequest): Observable<{
    id: string;
    name: string;
    email: string;
    password: string;
  }>;
  GetUserByMail(data: UserExistanceRequest): Observable<UserExistanceStatus>;
  VerifyUser(data: EmailVerifyRequest): Observable<UserExistanceStatus>;
}

@Injectable()
export class AuthService {
  private usersService: UsersService;
  private readonly saltRounds = 10;
  private readonly DEVICE_LIMIT = 3;
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 6 days

  constructor(
    @Inject('USER_SERVICE') private readonly client: ClientGrpc,
    private kafkaProducer: KafkaService,
    private redisService: RedisService,
    private readonly jwtService: JwtService,
    private kongService: KongService,
  ) {}

  onModuleInit() {
    this.usersService = this.client.getService<UsersService>('UserService');
  }

  //========================Register=============================//
  async register(registerDto: RegisterDto) {
    const { email } = registerDto;
    //hash password logic
    const hashedPassword = await hashPassword(registerDto.password);
    const userData = {
      name: registerDto?.name,
      email: registerDto?.email,
      password: hashedPassword,
      registerType:
        registerDto?.registerType == RegisterType.MAIL
          ? ProtoRegisterType?.MAIL
          : ProtoRegisterType?.PHONE,
    };
    const user = await firstValueFrom(this.usersService.CreateUser(userData));

    const token = generateVerificationToken();
    //set verification token
    await this.redisService.set(`email_verif_${user.email}`, token, 600);

    const registerEvent: UserRegisteredEvent = {
      id: user.id,
      name: user.name,
      email: user.email,
      token: token,
    };

    await this.sendRegisterEventToNotificationService({
      data: registerEvent,
      userId: user.id,
    });

    if (email) await this.kongService.registerFrontendClient(email);

    return {
      message: 'User registered successfully',
      user,
    };
  }

  //========================Verify=============================//
  async verify(verifyDto: VerifyDto): Promise<string> {
    const { email } = verifyDto;
    const storedToken = await this.redisService.get(
      `email_verif_${verifyDto.email}`,
    );
    if (!storedToken || storedToken !== verifyDto.token) {
      throw new BadRequestException('Invalid or expired token');
    }

    await firstValueFrom(
      this.usersService.VerifyUser({
        isVerified: true,
        email: email,
      }),
    );

    return 'Email verified successfully';
  }

  //========================Login=============================//
  async login(loginDto: LoginDto) {
    const { email } = loginDto;
    const data = {
      email: loginDto?.email,
    };

    const user = await firstValueFrom(this.usersService.GetUserByMail(data));

    if (!user.isVerified) {
      // send
      const token = generateVerificationToken();
      await this.redisService.set(`email_verif_${user.email}`, token, 600);
      const registerEvent: UserRegisteredEvent = {
        id: user.id,
        name: user.name,
        email: user.email,
        token: token,
      };

      const userId = user.id;
      await this.sendRegisterEventToNotificationService({
        data: registerEvent,
        userId,
      });

      return 'Check your mail for verification link you are not verified yet!!';
    }

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const password = loginDto.password;
    const hashedPassword = user.password;
    const isPasswordMatch = await comparePassword(password, hashedPassword);
    if (!isPasswordMatch)
      throw new UnauthorizedException('Invalid credentials');

    const deviceKey = this.getDeviceKey(user.id);

    const allActiveDevices = await this.getAllActiveDevices(deviceKey);

    await this.removeOldDevice({
      allDevices: allActiveDevices,
      currentDeviceId: loginDto.deviceId,
      deviceKey: deviceKey,
      userId: user.id,
    });

    await this.addDevice({
      deviceId: loginDto.deviceId,
      deviceKey: deviceKey,
    });

    // token logic
    // get kong jwt credentials
    const kongJwtArr = await this.kongService.getJwtCredentials(email);
    const kongJwt = kongJwtArr[0];
    const deviceId = loginDto.deviceId;

    const payload = {
      iss: kongJwt.key,
      sub: user.id,
      email: user.email,
      userId: user.id,
      deviceId,
    };

    // Sign token using kong secret
    const accessToken = this.jwtService.sign(payload, {
      secret: kongJwt.secret,
      algorithm: 'HS256',
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: kongJwt.secret,
      algorithm: 'HS256',
      expiresIn: `${this.REFRESH_TOKEN_EXPIRY}s`,
    });

    await this.storeRefreshToken({
      deviceId: deviceId,
      token: refreshToken,
      userId: user.id,
    });

    return { accessToken, refreshToken };
  }

  //========================Token Rotation=============================//
  async tokenRotation(rotationDto: TokenRotationDto) {
    const { deviceId, token, userId } = rotationDto;
    const tokenKey = this.getRefreshTokenKey(userId, deviceId);
    const storedToken = await this.redisService.get(tokenKey);
    if (!storedToken || storedToken !== token) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = this.jwtService.sign(
      { sub: userId, deviceId },
      { expiresIn: this.ACCESS_TOKEN_EXPIRY },
    );

    return { accessToken };
  }

  //========================Logout=============================//
  async logout(logoutDto: LogoutDto) {
    const { deviceId, userId } = logoutDto;
    const deviceKey = this.getDeviceKey(userId);
    await this.redisService.zRem(deviceKey, deviceId);
    await this.redisService.del(this.getRefreshTokenKey(userId, deviceId));
    return 'Logout successfully...';
  }

  // helper functions
  private async sendRegisterEventToNotificationService({
    data,
    userId,
  }: {
    data: UserRegisteredEvent;
    userId: string;
  }) {
    await this.kafkaProducer.publish(
      KAFKA_TOPICS.USER_REGISTERED,
      data,
      userId,
    );
  }

  private getDeviceKey(userId: string) {
    return `user_devices_${userId}`;
  }

  private getRefreshTokenKey(userId: string, deviceId: string) {
    return `refresh_token_${userId}_${deviceId}`;
  }

  private async getAllActiveDevices(deviceKey: string) {
    const allActiveDevices = await this.redisService
      .getClient()
      .zrangebyscore(deviceKey, '-inf', '+inf', 'WITHSCORES');

    return allActiveDevices;
  }

  private async removeOldDevice({
    allDevices,
    currentDeviceId,
    deviceKey,
    userId,
  }: {
    allDevices: string[];
    currentDeviceId: string;
    deviceKey: string;
    userId: string;
  }) {
    if (
      allDevices.length >= this.DEVICE_LIMIT * 2 &&
      !allDevices.some(
        (_, i) => i % 2 === 0 && allDevices[i] === currentDeviceId,
      )
    ) {
      const oldestDevice = allDevices[0];
      await this.redisService.getClient().zrem(deviceKey, oldestDevice);
      await this.redisService.del(
        this.getRefreshTokenKey(userId, oldestDevice),
      );
    }
  }

  private async addDevice({
    deviceId,
    deviceKey,
  }: {
    deviceId: string;
    deviceKey: string;
  }) {
    const now = Date.now();
    await this.redisService.zAdd(deviceKey, now, deviceId);
    await this.redisService.expire(deviceKey, this.REFRESH_TOKEN_EXPIRY);
  }

  private async storeRefreshToken({
    token,
    userId,
    deviceId,
  }: {
    token: string;
    userId: string;
    deviceId: string;
  }) {
    const key = this.getRefreshTokenKey(userId, deviceId);
    const value = token;
    const exTime = this.REFRESH_TOKEN_EXPIRY;
    const storedToken = await this.redisService.set(key, value, exTime);
    return storedToken;
  }
}

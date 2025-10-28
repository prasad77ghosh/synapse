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
  RegisterType as ProtoRegisterType,
  UserExistanceRequest,
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

interface UsersService {
  CreateUser(data: CreateUserRequest): Observable<{
    id: string;
    name: string;
    email: string;
    password: string;
  }>;
  GetUserByMail(data: UserExistanceRequest): Observable<{
    id: string;
    name: string;
    email: string;
    password: string;
  }>;
}

@Injectable()
export class AuthService {
  private usersService: UsersService;
  private readonly saltRounds = 10;

  constructor(
    @Inject('USER_SERVICE') private readonly client: ClientGrpc,
    private kafkaProducer: KafkaService,
    private redisService: RedisService,
  ) {}

  onModuleInit() {
    this.usersService = this.client.getService<UsersService>('UserService');
  }
  async register(registerDto: RegisterDto) {
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

    await this.kafkaProducer.publish(
      KAFKA_TOPICS.USER_REGISTERED,
      registerEvent,
      user.id,
    );

    return {
      message: 'User registered successfully',
      user,
    };
  }

  async verify(verifyDto: VerifyDto): Promise<string> {
    const storedToken = await this.redisService.get(
      `email_verif_${verifyDto.email}`,
    );
    if (!storedToken || storedToken !== verifyDto.token) {
      throw new BadRequestException('Invalid or expired token');
    }
    return 'Email verified successfully';
  }

  async login(loginDto: LoginDto) {
    const data = {
      email: loginDto?.email,
    };
    const user = await firstValueFrom(this.usersService.GetUserByMail(data));

    if (!user) throw new UnauthorizedException('Invalid credentials');
    
    const password = loginDto.password;
    const hashedPassword = user.password;
    const isPasswordMatch = await comparePassword(password, hashedPassword);
    if (!isPasswordMatch)
      throw new UnauthorizedException('Invalid credentials');
  }
}

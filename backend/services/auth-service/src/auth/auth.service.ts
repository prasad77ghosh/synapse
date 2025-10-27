import { Inject, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { CreateUserRequest } from 'src/proto/user.pb';
import { hashPassword } from 'src/utils/hash.utils';
import { KafkaService } from 'src/kafka/kafka.service';
import {
  KAFKA_TOPICS,
  UserRegisteredEvent,
} from '@synapse/shared/dist/kafka-config/src';

interface UsersService {
  CreateUser(data: CreateUserRequest): Observable<{
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
    };
    const user = await firstValueFrom(this.usersService.CreateUser(userData));

    const registerEvent: UserRegisteredEvent = {
      id: user.id,
      name: user.name,
      email: user.email,
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
}

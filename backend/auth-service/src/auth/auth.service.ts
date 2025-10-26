import { Inject, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { CreateUserRequest } from 'src/proto/user.pb';
import * as bcrypt from 'bcrypt';

interface UsersService {
  CreateUser(data: CreateUserRequest): Observable<{
    name: string;
    email: string;
    password: string;
  }>;
}

@Injectable()
export class AuthService {
  private usersService: UsersService;
  private readonly saltRounds = 10;

  constructor(@Inject('USER_SERVICE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.usersService = this.client.getService<UsersService>('UserService');
  }
  async register(registerDto: RegisterDto) {
    //hash password
    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      this.saltRounds,
    );
    const userData = {
      name: registerDto?.name,
      email: registerDto?.email,
      password: hashedPassword,
    };
    const user = await firstValueFrom(this.usersService.CreateUser(userData));
    return {
      message: 'User registered successfully',
      user,
    };
  }
}

import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateUserDto } from 'src/dto/user.dto';
import { CreateUserResponse } from 'src/proto/user.pb';
// import { GrpcMethod } from '@nestjs/microservices';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  @GrpcMethod('UserService', 'CreateUser')
  async createUser(data: CreateUserDto): Promise<CreateUserResponse> {
    return await this.userService.createUser(data);
  }
}

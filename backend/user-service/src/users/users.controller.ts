import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { GrpcMethod } from '@nestjs/microservices';
// import { GrpcMethod } from '@nestjs/microservices';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  @GrpcMethod('UserService', 'CreateUser')
  createUser(data: { name: string; email: string; password: string }) {
    return this.userService.createUser(data);
  }
}

import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateUserDto, GetUserByMailDto, VerifyDto } from 'src/dto/user.dto';
import { CreateUserResponse, UserExistanceStatus } from 'src/proto/user.pb';
// import { GrpcMethod } from '@nestjs/microservices';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  @GrpcMethod('UserService', 'createUser')
  async createUser(data: CreateUserDto): Promise<CreateUserResponse> {
    return await this.userService.createUser(data);
  }

  @GrpcMethod('UserService', 'GetUserByMail')
  async getUserByMail(
    data: GetUserByMailDto,
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  ): Promise<UserExistanceStatus | null> {
    return await this.userService.getUserByMail(data);
  }

  @GrpcMethod('UserService', 'VerifyUser')
  async verify(
    data: VerifyDto,
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  ): Promise<UserExistanceStatus | null> {
    return await this.userService.verify(data);
  }
}

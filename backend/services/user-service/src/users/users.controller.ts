import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateUserDto, GetUserByMailDto, VerifyDto } from 'src/dto/user.dto';
import { CreateUserResponse, UserExistanceStatus } from 'src/proto/user.pb';
import { AuthGuard } from 'src/auth-guard/auth.guard';
import type { JwtRequest } from 'src/interfaces/authenticated-request.interface';

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
  ): Promise<UserExistanceStatus | null> {
    return await this.userService.getUserByMail(data);
  }

  @GrpcMethod('UserService', 'VerifyUser')
  async verify(data: VerifyDto): Promise<UserExistanceStatus | null> {
    return await this.userService.verify(data);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  async getProfile(@Request() req: JwtRequest) {
    const { userId } = req.user;
    return await this.userService.getUserProfile(userId);
  }
}

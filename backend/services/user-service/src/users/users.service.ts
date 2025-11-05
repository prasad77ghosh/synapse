import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto, GetUserByMailDto, VerifyDto } from 'src/dto/user.dto';
import { CreateUserResponse, UserExistanceStatus } from 'src/proto/user.pb';
import { handlePrismaError } from 'src/utils/prisma-error.util';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: CreateUserDto): Promise<CreateUserResponse> {
    try {
      const user = await this.prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: data.password,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
      };
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async getUserByMail(
    data: GetUserByMailDto,
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  ): Promise<UserExistanceStatus | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: data.email,
        },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          isVerified: true,
        },
      });

      return user;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async verify(data: VerifyDto): Promise<UserExistanceStatus | null> {
    try {
      const { isVerified, email } = data;
      const user = await this.prisma.user.update({
        where: {
          email: email,
        },
        data: {
          isVerified: isVerified,
        },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          isVerified: true,
        },
      });
      return user;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async getUserProfile(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          email: true,
          avatar: true,
          dateOfBirth: true,
          gender: true,
          name: true,
          phone: true,
        },
      });
      return user;
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto } from 'src/dto/user.dto';
import { CreateUserResponse } from 'src/proto/user.pb';
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
}

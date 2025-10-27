// src/utils/prisma-error.util.ts
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

export function handlePrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        throw new ConflictException('Record already exists');
      case 'P2003':
        throw new BadRequestException('Invalid relation reference');
      default:
        throw new BadRequestException(`Database error: ${error.message}`);
    }
  }
  throw new InternalServerErrorException('Unexpected database error');
}

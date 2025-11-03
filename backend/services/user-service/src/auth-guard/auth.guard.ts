import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

interface JwtPayload {
  iss: string;
  sub: string;
  email: string;
  deviceId: string;
}
interface JwtRequest extends Request {
  user?: JwtPayload;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<JwtRequest>();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException('Authorization header malformed');
    }
    const token = parts[1];
    try {
      const payload = this.jwtService.verify(token) as JwtPayload;
      request.user = payload;
      return true;
    } catch (error: unknown) {
      // Narrow error type to avoid unsafe assignment
      if (error instanceof Error) {
        throw new UnauthorizedException(error.message);
      } else {
        throw new UnauthorizedException('Invalid token');
      }
    }
  }
}

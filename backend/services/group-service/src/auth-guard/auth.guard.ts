/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/interfaces/auth-payload.interface';
import { JwtRequest } from 'src/interfaces/authenticated-request.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<JwtRequest>();
    const authHeader = request?.headers['authorization'] as string;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    // Normalize and extract token safely
    const token = this.extractToken(authHeader);
    if (!token) {
      throw new UnauthorizedException('Invalid Authorization header format');
    }

    try {
      const payload = this.jwtService.decode<JwtPayload>(token);
      request.user = payload;
      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw new UnauthorizedException(
          `Token verification failed: ${error.message}`,
        );
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractToken(authHeader: string): string | null {
    const match = authHeader.trim().match(/^Bearer\s+(.+)$/i);
    return match ? match[1].trim() : null;
  }
}

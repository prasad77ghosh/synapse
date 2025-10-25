import { Inject, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';

interface UsersService {
  CreateUser(data: RegisterDto): Observable<any>;
}

@Injectable()
export class AuthService {
  private usersService: UsersService;

  constructor(@Inject('USER_SERVICE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.usersService = this.client.getService<UsersService>('UserService');
  }
  async register(registerDto: RegisterDto) {
    const user = await firstValueFrom(this.usersService.CreateUser(registerDto));
    return { message: 'Register endpoint' };
  }

  //   login(loginDto: any) {
  //     // logic here
  //     return { message: 'Login endpoint' };
  //   }

  //   refreshToken(refreshDto: any) {
  //     // logic here
  //     return { message: 'Refresh token endpoint' };
  //   }

  //   logout(req: any) {
  //     // logic here
  //     return { message: 'Logout endpoint' };
  //   }

  //   verifyEmail(token: string) {
  //     // logic here
  //     return { message: `Verify email token: ${token}` };
  //   }

  //   forgotPassword(forgotPasswordDto: any) {
  //     // logic here
  //     return { message: 'Forgot password endpoint' };
  //   }

  //   resetPassword(resetPasswordDto: any) {
  //     // logic here
  //     return { message: 'Reset password endpoint' };
  //   }

  //   getCurrentUser(req: any) {
  //     // logic here
  //     return { message: 'Get current user endpoint' };
  //   }

  //   changePassword(req: any, changePasswordDto: any) {
  //     // logic here
  //     return { message: 'Change password endpoint' };
  //   }

  //   deleteAccount(req: any) {
  //     // logic here
  //     return { message: 'Delete account endpoint' };
  //   }
}

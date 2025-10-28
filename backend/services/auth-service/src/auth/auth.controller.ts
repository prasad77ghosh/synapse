import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyDto } from './dto/verify.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('verify')
  async verify(@Body() verifyDto: VerifyDto): Promise<{ message: string }> {
    const message = await this.authService.verify(verifyDto);
    return { message };
  }

  @Post('login')
  async login(@Body() data: LoginDto) {
    const res = await this.authService.login(data);
    return { res };
  }

  @Post('rotate-token')
  async rotateToken(@Body() data: LogoutDto) {
    const res = await this.authService.logout(data);
    return { res };
  }
}

import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  //   @Post('login')
  //   login(@Body() loginDto: any) {
  //     return this.authService.login(loginDto);
  //   }

  //   @Post('refresh')
  //   refreshToken(@Body() refreshDto: any) {
  //     return this.authService.refreshToken(refreshDto);
  //   }

  //   @Post('logout')
  //   logout(@Req() req: any) {
  //     return this.authService.logout(req);
  //   }

  //   @Get('verify-email/:token')
  //   verifyEmail(@Param('token') token: string) {
  //     return this.authService.verifyEmail(token);
  //   }

  //   @Post('forgot-password')
  //   forgotPassword(@Body() forgotPasswordDto: any) {
  //     return this.authService.forgotPassword(forgotPasswordDto);
  //   }

  //   @Post('reset-password')
  //   resetPassword(@Body() resetPasswordDto: any) {
  //     return this.authService.resetPassword(resetPasswordDto);
  //   }

  //   @Get('me')
  //   getCurrentUser(@Req() req: any) {
  //     return this.authService.getCurrentUser(req);
  //   }

  //   @Patch('change-password')
  //   changePassword(@Req() req: any, @Body() changePasswordDto: any) {
  //     return this.authService.changePassword(req, changePasswordDto);
  //   }

  //   @Delete('delete-account')
  //   deleteAccount(@Req() req: any) {
  //     return this.authService.deleteAccount(req);
  //   }
}

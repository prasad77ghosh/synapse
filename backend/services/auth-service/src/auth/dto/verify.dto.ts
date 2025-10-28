import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerifyDto {
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsString({ message: 'Token must be a string' })
  @IsNotEmpty({ message: 'Token is required' })
  token: string;
}

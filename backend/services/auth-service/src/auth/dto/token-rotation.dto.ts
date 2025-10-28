import { IsString, IsNotEmpty } from 'class-validator';

export class TokenRotationDto {
  @IsString({ message: 'User ID must be an string' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;

  @IsString({ message: 'Device ID must be a string' })
  @IsNotEmpty({ message: 'Device ID is required' })
  deviceId: string;

  @IsString({ message: 'Token must be a string' })
  @IsNotEmpty({ message: 'Token is required' })
  token: string;
}

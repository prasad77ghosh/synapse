import { IsString, IsNotEmpty } from 'class-validator';

export class LogoutDto {
  @IsString({ message: 'User ID must be an integer' })
  @IsNotEmpty({ message: 'User ID must be a positive number' })
  userId: string;

  @IsString({ message: 'Device ID must be a string' })
  @IsNotEmpty({ message: 'Device ID is required' })
  deviceId: string;
}

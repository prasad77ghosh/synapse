import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(32)
  password: string;
}

export class GetUserByMailDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}

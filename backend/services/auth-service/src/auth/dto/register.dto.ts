import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidateIf,
  IsPhoneNumber,
  IsEnum,
} from 'class-validator';

// Enum matching Prisma schema
export enum RegisterType {
  MAIL = 'MAIL',
  PHONE = 'PHONE',
}

//
// ─── Match Passwords Validator ─────────────────────────────
//
@ValidatorConstraint({ name: 'MatchPasswords', async: false })
export class MatchPasswords implements ValidatorConstraintInterface {
  validate(confirmPassword: string, args: ValidationArguments) {
    const object = args.object as RegisterDto;
    return confirmPassword === object.password;
  }

  defaultMessage() {
    return 'Passwords do not match';
  }
}

//
// ─── Register DTO ─────────────────────────────────────────────
//
export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  name: string;

  @IsEnum(RegisterType, { message: 'registerType must be MAIL or PHONE' })
  registerType: RegisterType = RegisterType.MAIL;

  // Email — required if registerType = MAIL
  @ValidateIf((o: RegisterDto) => o.registerType === RegisterType.MAIL)
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required when registerType is MAIL' })
  email?: string;

  // Phone — required if registerType = PHONE
  @ValidateIf((o: RegisterDto) => o.registerType === RegisterType.PHONE)
  @IsPhoneNumber('IN', { message: 'Invalid phone number' })
  @IsNotEmpty({
    message: 'Phone number is required when registerType is PHONE',
  })
  phone?: string;

  @ValidateIf((o: RegisterDto) => o.registerType === RegisterType.MAIL)
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(32, { message: 'Password must not exceed 32 characters' })
  password: string;

  @ValidateIf((o: RegisterDto) => o.registerType === RegisterType.MAIL)
  @IsString()
  @IsNotEmpty({ message: 'Confirm password is required' })
  @Validate(MatchPasswords)
  confirmPassword: string;
}

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Matches(/^[1-9]\d*$/, {
    message:
      'phone_number must contain only digits and starts with country code',
  })
  phone_number: string;

  @IsEmail()
  email: string;

  @IsStrongPassword(
    {
      minLength: 8,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'password must be 8+ characters and contain at least 1 uppercase, 1 number, and 1 symbol',
    },
  )
  password: string;
}

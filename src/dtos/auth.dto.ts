import { UserType } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  Matches,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class SignUpDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Matches(/^\+\d{3}\s?\d{3}\s?\d{3}\s?\d{3}$/, {
    message: 'Phone number must a valid phone number',
  })
  phone: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  password: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  productKey?: string;
}

export class SignInDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  password: string;
}

export class GenerateProductKeyDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsEnum(UserType)
  userType: UserType;
}

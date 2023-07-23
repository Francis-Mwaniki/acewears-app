import {
  IsString,
  IsPositive,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsEmail,
} from 'class-validator';

export class CreateOrderDto {
  @IsPositive()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  productId: number;
}
export class ContactDTO {
  @IsString()
  @IsNotEmpty()
  contactName: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}

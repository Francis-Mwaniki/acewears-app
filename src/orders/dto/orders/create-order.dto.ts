import {
  IsString,
  IsPositive,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsEmail,
  IsArray,
} from 'class-validator';
import { OrderItem } from 'src/Utils.interfaces';

export class CreateOrderDto {
  /* {
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
		{
			"productId":2,
			"quantity":3
		}
  ]
}
 */
  @IsNotEmpty()
  @IsArray()
  items: OrderItem[];
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

import {
  IsString,
  IsPositive,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateOrderDto {
  @IsPositive()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  productId: number;
}

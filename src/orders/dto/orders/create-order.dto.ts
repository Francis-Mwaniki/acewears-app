import { IsString, IsPositive, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateOrderDto {
  @IsPositive()
  quantity: number;
}

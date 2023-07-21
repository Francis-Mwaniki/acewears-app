// transaction.dto.ts
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class ResponseTransactionDto {
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  msisdn: string;

  @IsInt()
  @IsNotEmpty()
  sync_count: number;

  @IsBoolean()
  is_complete: boolean;

  @IsString()
  @IsNotEmpty()
  sync_status: string;

  @IsString()
  @IsNotEmpty()
  link_id: string;

  @IsString()
  @IsNotEmpty()
  supporter_id: string;

  @IsString()
  @IsNotEmpty()
  external_reference: string;

  @IsOptional()
  @IsString()
  mpesa_receipt?: string;

  /*   createdAt: string;
  updatedAt: string; */
  updated: Date;
  created: Date;

  @IsInt()
  @IsNotEmpty()
  order_id: number;
}

export class CreateTransactionDto {
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  msisdn: string;
}
/* 


  amount              Float
  msisdn              String
  sync_count          Int
  is_complete         Int
  sync_status         String
  link_id             String
  supporter_id        String
  external_reference  String
  mpesa_receipt       String?
  order               Order        @relation(fields: [order_id], references: [id])
  order_id            Int
*/

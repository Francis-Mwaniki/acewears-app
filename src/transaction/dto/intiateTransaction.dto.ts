// transaction.dto.ts
import { PaymentMethod, TransactionStatus } from '@prisma/client';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { whichUser } from 'src/Utils.interfaces';

export class InitializeTransactionDto {
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  msisdn: string;

  @IsOptional()
  @IsInt()
  account_no?: number;
}

/* 
export interface IPaypalPayment {
  id: string;
  createTime: string;
  payerId: string;
  payerEmail: string;
  amount: string;
  payeeId: string;
  payeeEmail: string;
  merchantId: string;
  paymentMethod: PaymentMethod;
  currency: string;
  status: TransactionStatus;
}
*/
export class IPaypalPaymentDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  createTime: string;

  @IsNotEmpty()
  payerId: string;
  @IsNotEmpty()
  payerEmail: string;

  @IsNotEmpty()
  amount: string;

  @IsNotEmpty()
  payeeId: string;

  @IsNotEmpty()
  order_id: number;

  @IsNotEmpty()
  payeeEmail: string;

  @IsNotEmpty()
  merchantId: string;

  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @IsNotEmpty()
  currency: string;

  @IsNotEmpty()
  status: TransactionStatus;
}

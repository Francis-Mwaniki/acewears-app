import { PaymentMethod, TransactionStatus, categoryType } from '@prisma/client';
export interface SignUpParams {
  name: string;
  phone: string;
  email: string;
  password: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface GetProductsParams {
  title?: string;
  price: {
    lte?: number;
    gte?: number;
  };
  categoryType?: categoryType;
}

export interface CreateProductParams {
  price: number;
  title: string;
  description: string;
  categoryType: categoryType;
  image: { url: string }[];
  // category?: Category;
}
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
export interface whichUser {
  id: number;
  name: string;
  iat: number;
  exp: number;
}

export interface Category {
  id: number;
  name: string;
}
export interface TransactionParams {
  // id: string;
  amount: number;
  msisdn: string;
  sync_count: number;
  is_complete: boolean;
  sync_status: string;
  link_id: string;
  supporter_id: string;
  external_reference: string;
  mpesa_receipt?: string | null;
  order_id: number;
}
export interface CreateTransactionParams {
  amount: number;
  msisdn: string;
}

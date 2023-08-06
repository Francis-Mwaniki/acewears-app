import {
  PaymentMethod,
  PaymentStatus,
  TransactionStatus,
  categoryType,
} from '@prisma/client';
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
export interface OrderItem {
  productId: number;
  quantity: number; // Add the 'quantity' property here
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
  order_id: number;
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
export interface createContactParams {
  email: string;
  phone: string;
  address: string;
  contactName: string;
  city: string;
  zipCode: string;
  country: string;
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
// DTO for success data
export interface SuccessParams {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  CallbackMetadata: {
    Item: { Name: string; Value: any }[];
  };
  TinyPesaID: string;
  ExternalReference: string;
  Amount: number;
  Msisdn: string;
}

// DTO for error data
export interface ErrorParams {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  TinyPesaID: string;
  ExternalReference: string;
  Amount: number;
  Msisdn: string;
}
export interface methodsOfPayment {
  paymentMethod: PaymentMethod;
}
export interface statusOfPayment {
  paymentStatus: PaymentStatus;
}

export interface CreateOrderParams {
  items: { productId: number; quantity: number }[];
}

export interface UpdateOrderParams {
  id: number;
  PaymentStatus: PaymentStatus;
  PaymentMethod: PaymentMethod;
  completed: boolean;
  delivered: boolean;
}

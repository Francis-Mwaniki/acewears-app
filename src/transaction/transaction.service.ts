import { Injectable, NotFoundException } from '@nestjs/common';
import { UserType } from '@prisma/client';
import {
  CreateTransactionParams,
  ErrorParams,
  IPaypalPayment,
  SuccessParams,
  TransactionParams,
  whichUser,
} from 'src/Utils.interfaces';
import { ChatGateway } from 'src/chat/chat.gateway';
import { OrdersService } from 'src/orders/orders.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransactionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly chatGateway: ChatGateway,
    private readonly orderService: OrdersService,
  ) {}
  createTransaction(transaction: CreateTransactionParams) {
    return {
      ...transaction,
    };
  }
  async createMpesaTransactions(body: TransactionParams) {
    const transaction = this.prismaService.transaction.create({
      data: {
        amount: body.amount,
        msisdn: body.msisdn,
        sync_count: body.sync_count,
        is_complete: false,
        sync_status: body.sync_status,
        link_id: body.link_id,
        supporter_id: body.supporter_id,
        external_reference: body.external_reference,
        mpesa_receipt: body.mpesa_receipt,
        order_id: body.order_id,
      },

      include: {
        order: true,
      },
    });

    return transaction;
  }

  async createTinyPesaTransaction(body: any) {
    const transaction = this.prismaService.transaction.create({
      data: {
        amount: body.amount,
        msisdn: body.msisdn,
        sync_count: body.sync_count,
        is_complete: false,
        sync_status: body.sync_status,
        link_id: body.link_id,
        supporter_id: body.supporter_id,
        external_reference: body.external_reference,
        mpesa_receipt: body.mpesa_receipt,
        order_id: body.order_id,
      },

      include: {
        order: true,
      },
    });
    // const orderStatus = this.prismaService.order.update({
    //   where: {
    //     id: body.order_id,
    //   },
    //   data: {
    //     completed: true,
    //   },
    // });
    return transaction;
  }
  /* 
  
  merchantRequestID  String
  checkoutRequestID  String
  resultCode        Int
  resultDesc        String
  callbackMetadata  Json
  tinyPesaID        String
  externalReference String
  order             Order   @relation(fields: [order_id], references: [id])
  order_id          Int @default(1)
  amount            Int
  msisdn            String
  */

  async createSuccessfulTinyPesaTransaction(data: SuccessParams) {
    const transaction = this.prismaService.tinyCallback.create({
      data: {
        merchantRequestID: data.MerchantRequestID,
        checkoutRequestID: data.CheckoutRequestID,
        resultCode: data.ResultCode,
        resultDesc: data.ResultDesc,
        tinyPesaID: data.TinyPesaID,
        externalReference: data.ExternalReference,
        amount: data.Amount,
        msisdn: data.Msisdn,
        callbackMetadata: {
          create: {
            Item: {
              create: {
                Name: data.CallbackMetadata.Item[0].Name,
                Value: data.CallbackMetadata.Item[0].Value,
              },
            },
          },
        },
      },
    });
    return transaction;
  }

  async createErrorTinyPesaTransaction(data: ErrorParams) {
    const transaction = await this.prismaService.errorTinyCallback.create({
      data: {
        merchantRequestID: data.MerchantRequestID,
        checkoutRequestID: data.CheckoutRequestID,
        resultCode: data.ResultCode,
        resultDesc: data.ResultDesc,
        tinyPesaID: data.TinyPesaID,
        externalReference: data.ExternalReference,
        amount: data.Amount,
        msisdn: data.Msisdn,
      },
    });
    return transaction;
  }
  async createPaypalTransaction(
    body: IPaypalPayment,
    userType: UserType,
    user: whichUser,
  ) {
    try {
      // const findUser = this.prismaService.user.findUnique({
      //   where: {
      //     id: user.id,
      //   },
      // });
      const paypalTransaction = this.prismaService.paypalPayment.create({
        data: {
          id: body.id,
          create_time: body.createTime,
          payerID: body.payerId,
          payer_email: body.payerEmail,
          payment_method: body.paymentMethod,
          status: body.status,
          amount: body.amount,
          currency: body.currency,
          payeeID: body.payeeId,
          merchantID: body.merchantId,
          payee_email: body.payeeEmail,
          user: {
            connect: {
              id: user.id,
            },
          },
          order: {
            connect: {
              id: user.id,
            },
          },
        },
      });
      const findUser = this.prismaService.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          id: true,
          email: true,
          phone: true,
          name: true,
          orders: {
            select: {
              id: true,
              updatedAt: true,
            },
          },
        },
      });
      const order = await this.prismaService.order.findUnique({
        where: {
          id: (await paypalTransaction).order_id,
        },
      });
      if (order) {
        const userId = order.user_id;
        const orders = await this.orderService.updateOrder(
          order.id,
          {
            id: order.id,
            payment_method: 'PAYPAL',
            payment_status: 'COMPLETED',
          },
          userId,
        );
        console.log('paypal order', orders);
      }

      this.chatGateway.server.emit('paypal-order', {
        message: 'paypal payment successful',
      });
      return paypalTransaction;
    } catch (error) {
      return new NotFoundException('Something went wrong');
    }
  }
  getPaypalTransactions(user: whichUser) {
    const findPaypal = this.prismaService.paypalPayment.findMany({
      where: {
        user_id: user.id,
      },
      include: {
        user: true,
        order: true,
      },
    });
    if (!findPaypal) {
      return new NotFoundException('Transaction not found');
    }
    return findPaypal;
  }
  async getSinglePaypalTransaction(id: string, user: whichUser) {
    const findSingleTransactionByUser =
      this.prismaService.paypalPayment.findFirst({
        where: {
          id: id,
        },

        include: {
          user: true,
          order: true,
        },
      });

    if (!findSingleTransactionByUser) {
      return new NotFoundException('Transaction not found');
    }
    if (
      (await findSingleTransactionByUser.then((res) => res.user_id)) === user.id
    ) {
      return findSingleTransactionByUser;
    }
    return new NotFoundException('Transaction not found');
  }

  async deletePaypalTransaction(id: string, user: whichUser) {
    const findSingleTransactionByUser =
      this.prismaService.paypalPayment.findFirst({
        where: {
          id: id,
        },
        include: {
          user: true,
          order: true,
        },
      });
    if (!findSingleTransactionByUser) {
      return new NotFoundException('Transaction not found');
    }
    if (
      (await findSingleTransactionByUser.then((res) => res.user_id)) === user.id
    ) {
      await this.prismaService.paypalPayment.delete({
        where: {
          id: id,
        },
      });
      return { message: 'Transaction deleted successfully' };
    }
    return new NotFoundException('Transaction not found');
  }
  getTransactionById(id: string) {
    return {
      id,
    };
  }
  getTransactionStatus() {
    return {
      message: 'success',
    };
  }
  getMpesaTransactions() {
    const transactions = this.prismaService.transaction.findMany();
    return transactions;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { UserType } from '@prisma/client';
import {
  CreateTransactionParams,
  IPaypalPayment,
  TransactionParams,
  whichUser,
} from 'src/Utils.interfaces';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransactionService {
  constructor(private readonly prismaService: PrismaService) {}
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
        order: {
          select: {
            id: true,
            updatedAt: true,
            product: {
              select: {
                title: true,
                price: true,
                description: true,
                image: true,
              },
            },
          },
        },
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

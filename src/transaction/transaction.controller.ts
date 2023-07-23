import { ChatGateway } from './../chat/chat.gateway';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  IPaypalPayment,
  TransactionParams,
  whichUser,
} from './../Utils.interfaces';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  HttpCode,
  Delete,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { Transaction, UserType } from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorators';
import {
  CreateTransactionDto,
  ResponseTransactionDto,
} from './dto/dto.transaction';
import {
  IPaypalPaymentDto,
  InitializeTransactionDto,
} from './dto/intiateTransaction.dto';
import { User } from 'src/user/decorator/user.decorator';

@ApiTags('transaction')
@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly prismaService: PrismaService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @ApiCreatedResponse({ type: 'Transaction' })
  @Roles(UserType.BUYER)
  @Post('initialize')
  async initializeTransaction(@Body() body: ResponseTransactionDto) {
    return this.transactionService.createMpesaTransactions(body);
  }

  @ApiCreatedResponse({ type: 'Transaction' })
  @Roles(UserType.ADMIN, UserType.BUYER)
  @Post()
  createTransaction(@Body() body: CreateTransactionDto) {
    return this.transactionService.createTransaction(body);
  }

  /* paypal */
  @ApiCreatedResponse({ type: 'Transaction' })
  @Roles(UserType.BUYER)
  @Post('paypal')
  createPaypalTransaction(
    @Body() body: IPaypalPaymentDto,
    @User() user: whichUser,
    @Param('UserType') userType: UserType,
  ) {
    return this.transactionService.createPaypalTransaction(
      body,
      userType,
      user,
    );
  }
  /* get paypal */
  @ApiCreatedResponse({ type: 'Transaction' })
  @Roles(UserType.ADMIN, UserType.BUYER)
  @Get('paypal')
  getPaypalTransactions(@User() user: whichUser) {
    return this.transactionService.getPaypalTransactions(user);
  }
  /* getsingle paypal */
  @ApiCreatedResponse({ type: 'Transaction' })
  @Roles(UserType.ADMIN, UserType.BUYER)
  @Get('paypal/:id')
  getPaypalTransactionById(@Param('id') id: string, @User() user: whichUser) {
    return this.transactionService.getSinglePaypalTransaction(id, user);
  }
  /* delete  */
  @ApiCreatedResponse({ type: 'Transaction' })
  @Roles(UserType.ADMIN, UserType.BUYER)
  @Delete('paypal/:id')
  deletePaypalTransactionById(
    @Param('id') id: string,
    @User() user: whichUser,
  ) {
    return this.transactionService.deletePaypalTransaction(id, user);
  }
  @ApiCreatedResponse({})
  @Roles(UserType.ADMIN, UserType.BUYER)
  @Get('mpesa')
  getAllTransactions(): Promise<Transaction[]> {
    return this.transactionService.getMpesaTransactions();
  }

  @ApiCreatedResponse({ type: 'Transaction' })
  @Roles(UserType.ADMIN)
  @Get(':id')
  getTransactionById(@Param('id') id: string) {
    return this.transactionService.getTransactionById(id);
  }

  @ApiCreatedResponse({ type: 'Transaction' })
  // @Roles(UserType.ADMIN, UserType.BUYER)
  @Post('/tinypesa/')
  async createTinyPesaTransaction(@Body() body: any) {
    console.log('BODY', body);
    console.log(
      'BODY VALUES',
      body.Body.stkCallback.Amount,
      body.Body.stkCallback.Msisdn,
      body.Body.stkCallback.MerchantRequestID,
      body.Body.stkCallback.CheckoutRequestID,
      body.Body.stkCallback.ResultDesc,
      body.Body.stkCallback.TinyPesaID,
      body.Body.stkCallback.ResultCode,
      body.Body.stkCallback.ExternalReference,
    );
    if (body.Body.stkCallback.ResultCode !== 0) {
      this.chatGateway.server.emit('error', {
        data: body.Body.stkCallback.ResultDesc,
      });

      return await this.prismaService.errorTinyCallback.create({
        data: {
          amount: body.Body.stkCallback.Amount,
          msisdn: body.Body.stkCallback.Msisdn,
          merchantRequestID: body.Body.stkCallback.MerchantRequestID,
          checkoutRequestID: body.Body.stkCallback.CheckoutRequestID,
          resultDesc: body.Body.stkCallback.ResultDesc,
          tinyPesaID: body.Body.stkCallback.TinyPesaID,
          resultCode: body.Body.stkCallback.ResultCode,
          externalReference: body.Body.stkCallback.ExternalReference,
        },
      });
    }
    if (body.Body.stkCallback.ResultCode === 0) {
      this.chatGateway.server.emit('success', {
        data: body.Body.stkCallback.ResultDesc,
      });
      return await this.prismaService.tinyCallback.create({
        data: {
          amount: body.Body.stkCallback.Amount,
          msisdn: body.Body.stkCallback.Msisdn,
          merchantRequestID: body.Body.stkCallback.MerchantRequestID,
          checkoutRequestID: body.Body.stkCallback.CheckoutRequestID,
          resultDesc: body.Body.stkCallback.ResultDesc,
          tinyPesaID: body.Body.stkCallback.TinyPesaID,
          resultCode: body.Body.stkCallback.ResultCode,
          externalReference: body.Body.stkCallback.ExternalReference,
          callbackMetadata: {
            create: {
              Item: {
                create: {
                  Name: body.Body.stkCallback.CallbackMetadata.Item[0].Name,
                  Value: body.Body.stkCallback.CallbackMetadata.Item[0].Value,
                },
              },
            },
          },
        },
      });
    }
  }
  @ApiCreatedResponse({ type: 'Transaction' })
  @Roles(UserType.ADMIN, UserType.BUYER)
  @Get('callback')
  getTransactionStatus() {
    return this.transactionService.getTransactionStatus();
  }
}

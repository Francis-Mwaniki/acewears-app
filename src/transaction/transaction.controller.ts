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
  constructor(private readonly transactionService: TransactionService) {}

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
  @Post('/tinypesa')
  createTinyPesaTransaction(@Body() body: any) {
    console.log('body', body);
    return body;
  }

  @ApiCreatedResponse({ type: 'Transaction' })
  @Roles(UserType.ADMIN, UserType.BUYER)
  @Get('callback')
  getTransactionStatus() {
    return this.transactionService.getTransactionStatus();
  }
}

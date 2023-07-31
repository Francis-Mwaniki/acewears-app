import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ChatGateway } from 'src/chat/chat.gateway';
import { MailingService } from 'src/mailing/mailing.service';
import { OrdersService } from 'src/orders/orders.service';

@Module({
  imports: [PrismaModule],
  providers: [TransactionService, ChatGateway, MailingService, OrdersService],
  controllers: [TransactionController],
})
export class TransactionModule {}

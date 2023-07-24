import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ChatGateway } from 'src/chat/chat.gateway';

@Module({
  imports: [PrismaModule],
  providers: [TransactionService, ChatGateway],
  controllers: [TransactionController],
})
export class TransactionModule {}

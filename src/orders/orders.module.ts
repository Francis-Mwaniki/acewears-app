import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ChatGateway } from 'src/chat/chat.gateway';

@Module({
  imports: [PrismaModule, ChatGateway],
  controllers: [OrdersController],
  providers: [OrdersService, ChatGateway],
})
export class OrdersModule {}

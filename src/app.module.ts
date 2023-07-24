import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ProductsModule } from './products/products.module';
import { PrismaModule } from './prisma/prisma.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from './guards.auth';
import { UserInterceptor } from './user/interceptor/user.interceptor';
import { OrdersModule } from './orders/orders.module';
import { TransactionModule } from './transaction/transaction.module';
import { ChatGateway } from './chat/chat.gateway';

@Module({
  imports: [
    UserModule,
    ProductsModule,
    PrismaModule,
    OrdersModule,
    TransactionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: UserInterceptor,
    },
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard,
    },
    ChatGateway,
  ],
})
export class AppModule {}

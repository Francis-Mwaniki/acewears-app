import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [
    PrismaService,
    ProductsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
  controllers: [ProductsController],
})
export class ProductsModule {}

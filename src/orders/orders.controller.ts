// orders.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/orders/create-order.dto';
import { Roles } from 'src/decorators/roles.decorators';
import { UserType } from '@prisma/client';
import { whichUser } from 'src/Utils.interfaces';
import { User } from 'src/user/decorator/user.decorator';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiCreatedResponse({ description: 'Order created' })
  @Roles(UserType.BUYER, UserType.ADMIN)
  @Post(':id')
  async createOrder(
    @Body() body: CreateOrderDto,
    @Param('id', ParseIntPipe) productId: number,
    @User() user: whichUser,
  ) {
    return this.ordersService.createOrder(body, productId, user.id);
  }

  @ApiOkResponse({ description: 'Orders retrieved' })
  @Roles(UserType.BUYER, UserType.ADMIN)
  @Get()
  async getOrders(@User() user: whichUser) {
    return this.ordersService.getOrders(user.id);
  }

  @ApiOkResponse({ description: 'Order retrieved' })
  @Roles(UserType.BUYER, UserType.ADMIN)
  @Get(':id')
  async getOrder(
    @Param('id', ParseIntPipe) id: number,
    @User() user: whichUser,
  ) {
    return this.ordersService.getOrder(id, user.id);
  }

  @ApiCreatedResponse({ description: 'Order updated' })
  @Roles(UserType.ADMIN)
  @Post(':id/complete')
  async completeOrder(
    @Param('id', ParseIntPipe) id: number,
    @User() user: whichUser,
  ) {
    return this.ordersService.completeOrder(id, user.id);
  }
  //   @Roles(UserType.ADMIN)
  //   @Post(':id/ship')
  //   async shipOrder(@Param('id',ParseIntPipe) id: number, @User() user: whichUser) {
  //     return this.ordersService.shipOrder(id, user.id);
  //   }

  @ApiCreatedResponse({ description: 'Order updated' })
  @Roles(UserType.ADMIN)
  @Post(':id/deliver')
  async deliverOrder(
    @Param('id', ParseIntPipe) id: number,
    @User() user: whichUser,
  ) {
    return this.ordersService.deliverOrder(id, user.id);
  }
  @ApiCreatedResponse({ description: 'Order deleted by Admin' })
  @Roles(UserType.ADMIN)
  @Delete(':id/admin')
  async deleteOrderAdmin(
    @Param('id', ParseIntPipe) id: number,
    @User() user: whichUser,
  ) {
    return this.ordersService.deleteOrderAdmin(id, user.id);
  }

  @ApiCreatedResponse({ description: 'Order deleted by Buyer' })
  @Roles(UserType.BUYER)
  @Delete(':id')
  async deleteOrderBuyer(
    @Param('id', ParseIntPipe) id: number,
    @User() user: whichUser,
  ) {
    return this.ordersService.deleteOrderBuyer(id, user.id);
  }

  @ApiCreatedResponse({ description: 'Many orders deleted by admin' })
  @Roles(UserType.ADMIN)
  @Delete(':id/admin')
  async deleteAllOrdersAdmin(@User() user: whichUser) {
    return this.ordersService.deleteAllOrdersAdmin(user.id);
  }

  @ApiCreatedResponse({ description: 'Many orders deleted by buyer' })
  @Roles(UserType.BUYER)
  @Delete(':id/buyer')
  async deleteAllOrdersBuyer(@User() user: whichUser) {
    return this.ordersService.deleteAllOrdersBuyer(user.id);
  }
}

// orders.controller.ts

import {
  Controller,
  Get,
  Param,
  Delete,
  ParseIntPipe,
  Body,
  Post,
  Put,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { ContactDTO, CreateOrderDto } from './dto/orders/create-order.dto';
import { Roles } from 'src/decorators/roles.decorators';
import { Order, PaymentMethod, PaymentStatus, UserType } from '@prisma/client';
import { OrderItem, whichUser } from 'src/Utils.interfaces';
import { User } from 'src/user/decorator/user.decorator';
import { ChatGateway } from 'src/chat/chat.gateway';
@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly chatGateway: ChatGateway,
  ) {}
  @ApiCreatedResponse({ description: 'Order created' })
  @Roles(UserType.BUYER, UserType.ADMIN)
  @Post()
  async createOrder(
    @Body()
    orderData: {
      userId: number;
      contactId: number;
      items: OrderItem[];
      paymentMethod?: PaymentMethod;
      paymentStatus?: PaymentStatus;
    },
    @User() user: whichUser,
  ) {
    try {
      if (orderData.items.length === null || orderData.items.length === 0) {
        return { message: 'Order items cannot be empty' };
      }
      return this.ordersService.createOrder(orderData, user.id);
    } catch (error) {
      return new HttpException('Order not created', 500);
    }
  }

  @ApiCreatedResponse({ description: 'Admin retrieve all orders' })
  @Roles(UserType.ADMIN)
  @Get('admin-all-orders')
  async getAllOrdersAdmin() {
    return this.ordersService.getAllOrdersAdmin();
  }

  /* admin retrieve all users  */
  @ApiCreatedResponse({ description: 'Admin retrieve all users' })
  @Roles(UserType.ADMIN)
  @Get('admin-all-users')
  async getAllUsersAdmin() {
    return this.ordersService.getAllUsersAdmin();
  }

  @Get('address/:id')
  @ApiOkResponse({ description: 'Contact retrieved' })
  @Roles(UserType.BUYER, UserType.ADMIN)
  async getContact(@Param('id', ParseIntPipe) userId: number) {
    return this.ordersService.getContact(userId);
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
  @Put(':id/complete')
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

  /* update */
  @ApiCreatedResponse({ description: 'Order updated' })
  @Roles(UserType.ADMIN, UserType.BUYER)
  @Put(':id')
  async updateOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatedOrderData: Partial<Order>,
    @User() user: whichUser,
  ) {
    try {
      if (id === null || id === undefined) {
        return { message: 'Order Id cannot be empty' };
      }
      return this.ordersService.updateOrder(id, updatedOrderData, user.id);
    } catch (error) {
      return new HttpException('Order not updated', 500);
    }
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

  /* contacts */
  @ApiCreatedResponse({ description: 'Contact created' })
  @Roles(UserType.BUYER, UserType.ADMIN)
  @Post('add-address')
  async createContact(
    @Body() body: ContactDTO,
    @User() user: whichUser,
  ): Promise<ContactDTO> {
    return this.ordersService.createContact(body, user.id);
  }

  @ApiCreatedResponse({ description: 'Contact updated' })
  @Roles(UserType.BUYER, UserType.ADMIN)
  @Put('update-address/:id')
  async updateContact(
    @Body() body: ContactDTO,
    @User() user: whichUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ContactDTO> {
    return this.ordersService.updateContact(body, user.id, id);
  }
}

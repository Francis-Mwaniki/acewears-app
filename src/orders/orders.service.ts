import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto/orders/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prismaService: PrismaService) {}

  async getOrders(userId: number) {
    const orders = await this.prismaService.order.findMany({
      where: {
        user_id: userId,
      },
      select: {
        id: true,
        completed: true,
        quantity: true,
        createdAt: true,

        product: {
          select: {
            title: true,
            price: true,
            image: {
              select: {
                url: true,
              },
            },
          },
        },
        user: true,
        transactions: true,
        paypal_payments: true,
      },
    });

    return orders;
  }

  async getOrder(id: number, userId: number) {
    const order = await this.prismaService.order.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        completed: true,
        quantity: true,
        createdAt: true,
        user_id: true,
        product: {
          select: {
            title: true,
            price: true,
            image: {
              select: {
                url: true,
              },
            },
          },
        },
      },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.user_id !== userId) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async createOrder({ quantity, productId }: CreateOrderDto, userId: number) {
    const product = await this.prismaService.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
        price: true,
      },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    /* check if the order is already create in relation of the same product if so throw err */
    const orderExists = await this.prismaService.order.findFirst({
      where: {
        product_id: productId,
        user_id: userId,
      },
    });
    if (orderExists) {
      /* update quantity instead */
      const updatedOrder = await this.prismaService.order.update({
        where: {
          id: orderExists.id,
        },
        data: {
          quantity: orderExists.quantity + quantity,
        },
        select: {
          id: true,
          completed: true,
          quantity: true,
          createdAt: true,
          user_id: true,
          product: {
            select: {
              title: true,
              description: true,
              price: true,
              image: {
                select: {
                  url: true,
                },
              },
            },
          },
          transactions: true,
          paypal_payments: true,
        },
      });
      return updatedOrder;
    } else {
      const order = await this.prismaService.order.create({
        data: {
          quantity,
          completed: false,
          product: {
            connect: {
              id: productId,
            },
          },
          user: {
            connect: {
              id: userId,
            },
          },
        },
        select: {
          id: true,
          completed: true,
          quantity: true,
          createdAt: true,
          user_id: true,
          product: {
            select: {
              title: true,
              price: true,
              image: {
                select: {
                  url: true,
                },
              },
            },
          },
          transactions: true,
          paypal_payments: true,
        },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }
      if (order.user_id !== userId) {
        throw new NotFoundException('Order not found');
      }
      return order;
    }
  }

  async updateOrder({ quantity }: CreateOrderDto, id: number, userId: number) {
    const order = await this.prismaService.order.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        user_id: true,
        completed: true,
        updatedAt: true,
        product: {
          select: {
            id: true,
            price: true,
            title: true,
            description: true,
            image: {
              select: {
                url: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.user_id !== userId) {
      throw new NotFoundException('Order not found');
    }

    const updatedOrder = await this.prismaService.order.update({
      where: {
        id,
      },
      data: {
        quantity,
      },
    });

    return updatedOrder;
  }
  async deleteOrderAdmin(id: number, userId: number) {
    const order = await this.prismaService.order.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        user_id: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.user_id !== userId) {
      throw new NotFoundException('Order not found');
    }

    await this.prismaService.order.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Order deleted successfully',
    };
  }
  async deleteOrderBuyer(id: number, userId: number) {
    const order = await this.prismaService.order.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        user_id: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.user_id !== userId) {
      throw new NotFoundException('Order not found');
    }

    await this.prismaService.order.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Order deleted successfully',
    };
  }

  async deleteAllOrdersBuyer(userId: number) {
    await this.prismaService.order.deleteMany({
      where: {
        user_id: userId,
      },
    });
    if (!userId) {
      throw new NotFoundException('Order not found');
    }

    return {
      message: 'All Orders deleted successfully',
    };
  }
  async deleteAllOrdersAdmin(userId: number) {
    await this.prismaService.order.deleteMany({
      where: {
        user_id: userId,
      },
    });
    if (!userId) {
      throw new NotFoundException('Order not found');
    }

    return {
      message: 'All Orders deleted successfully',
    };
  }
  async completeOrder(id: number, userId: number) {
    const order = await this.prismaService.order.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        user_id: true,
        delivered: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.user_id !== userId) {
      throw new NotFoundException('Order not found');
    }

    const updatedOrder = await this.prismaService.order.update({
      where: {
        id,
      },
      data: {
        completed: false,
      },
    });

    return updatedOrder;
  }
  async deliverOrder(id: number, userId: number) {
    const order = await this.prismaService.order.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        user_id: true,
        completed: true,
        delivered: true,
        product: {
          select: {
            id: true,
            price: true,
            title: true,
            description: true,
            image: {
              select: {
                url: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.user_id !== userId) {
      throw new NotFoundException('Order not found');
    }

    const updatedOrder = await this.prismaService.order.update({
      where: {
        id,
      },
      select: {
        user: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
        product: {
          select: {
            title: true,
            price: true,
            description: true,
            image: {
              select: {
                url: true,
              },
            },
          },
        },
      },
      data: {
        delivered: true,
        completed: true,
      },
    });

    return updatedOrder;
  }
}

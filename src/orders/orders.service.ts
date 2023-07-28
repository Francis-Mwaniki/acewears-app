import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContactDTO, CreateOrderDto } from './dto/orders/create-order.dto';
import { createContactParams } from 'src/Utils.interfaces';
import { ChatGateway } from 'src/chat/chat.gateway';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly chatGateway: ChatGateway,
  ) {}

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

  async getAllUsersAdmin() {
    const users = await this.prismaService.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        contacts: true,
        buyer_messages: true,
        orders: {
          select: {
            id: true,
          },
        },
      },
    });

    return users;
  }
  async getAllOrdersAdmin() {
    const orders = await this.prismaService.order.findMany({
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
        contact: true,
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
        image: {
          select: {
            url: true,
          },
        },
        description: true,
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
          completed: false,
        },
        select: {
          id: true,
          completed: true,
          quantity: true,
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
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
          contact: true,
          transactions: true,
          paypal_payments: true,
        },
      });
      this.chatGateway.server.emit('order-update', {
        title: 'Order Updated',
        data: ` order of id ${updatedOrder.id} was updated by ${updatedOrder.user.name} at ${updatedOrder.createdAt}`,
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
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
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
          contact: true,
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
      this.chatGateway.server.emit('order-create', {
        title: 'order created',
        data: `order of id ${order.id} was created by ${order.user.name} at ${order.createdAt}`,
      });
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
        quantity: true,
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
        quantity: 0,
        completed: true,
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

    /* delete address first */

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

  async createContact(
    {
      contactName,
      address,
      zipCode,
      city,
      country,
      phone,
      email,
    }: createContactParams,
    userId: number,
  ) {
    const contact = await this.prismaService.contact.create({
      data: {
        contactName,
        address,
        zipCode,
        phone,
        email,
        city,
        country,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    return contact;
  }

  async getContact(userId: number) {
    const userWithContact = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        contacts: true,
      },
    });

    if (!userWithContact) {
      throw new NotFoundException('User not found');
    }

    return userWithContact;
  }
  async updateContact(
    {
      contactName,
      address,
      zipCode,
      city,
      country,
      phone,
      email,
    }: createContactParams,
    userId: number,
    id: number,
  ) {
    const contact = await this.prismaService.contact.findUnique({
      where: {
        id: id,
      },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }
    return await this.prismaService.contact.update({
      where: {
        id: id,
      },
      data: {
        contactName,
        address,
        zipCode,
        city,
        country,
        phone,
        email,
      },
    });
  }
}

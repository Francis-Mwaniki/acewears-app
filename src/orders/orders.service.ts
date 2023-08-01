import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContactDTO, CreateOrderDto } from './dto/orders/create-order.dto';
import { createContactParams } from 'src/Utils.interfaces';
import { ChatGateway } from 'src/chat/chat.gateway';
import { MailingService } from 'src/mailing/mailing.service';
import { Order, PaymentStatus, PaymentMethod } from '@prisma/client';
import { OrderItem } from 'src/Utils.interfaces';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly chatGateway: ChatGateway,
    private readonly mailingService: MailingService,
  ) {}

  async getOrders(userId: number) {
    const orders = await this.prismaService.order.findMany({
      where: {
        user_id: userId,
      },
      select: {
        id: true,
        payment_method: true,
        payment_status: true,
        completed: true,
        quantity: true,
        createdAt: true,
        user_id: true,
        total: true,
        items: {
          select: {
            id: true,
            quantity: true,
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
        },
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
        user_id: true,
        items: {
          select: {
            id: true,
            quantity: true,
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
        items: {
          select: {
            id: true,
            quantity: true,
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

  // async createOrder({ quantity, productId }: CreateOrderDto, userId: number) {
  //   const product = await this.prismaService.product.findUnique({
  //     where: {
  //       id: productId,
  //     },
  //     select: {
  //       id: true,
  //       price: true,
  //       image: {
  //         select: {
  //           url: true,
  //         },
  //       },
  //       description: true,
  //     },
  //   });
  //   if (!product) {
  //     throw new NotFoundException('Product not found');
  //   }
  //   /* check if the order is already create in relation of the same product if so throw err */
  //   const orderExists = await this.prismaService.order.findFirst({
  //     where: {
  //       id
  //       user_id: userId,
  //     },
  //   });
  //   if (orderExists) {
  //     /* update quantity instead */
  //     const updatedOrder = await this.prismaService.order.update({
  //       where: {
  //         id: orderExists.id,
  //       },
  //       data: {
  //         quantity: orderExists.quantity + quantity,
  //         completed: false,
  //       },
  //       select: {
  //         id: true,
  //         completed: true,
  //         quantity: true,
  //         user: {
  //           select: {
  //             name: true,
  //             email: true,
  //             phone: true,
  //           },
  //         },
  //         createdAt: true,
  //         user_id: true,
  //         product: {
  //           select: {
  //             title: true,
  //             description: true,
  //             price: true,
  //             image: {
  //               select: {
  //                 url: true,
  //               },
  //             },
  //           },
  //         },
  //         contact: true,
  //         transactions: true,
  //         paypal_payments: true,
  //       },
  //     });
  //     this.chatGateway.server.emit('order-update', {
  //       title: 'Order Updated',
  //       data: ` order of id ${updatedOrder.id} was updated by ${updatedOrder.user.name} at ${updatedOrder.createdAt}`,
  //     });
  //     return updatedOrder;
  //   } else {
  //     const order = await this.prismaService.order.create({
  //       data: {
  //         quantity,
  //         completed: false,
  //         product: {
  //           connect: {
  //             id: productId,
  //           },
  //         },
  //         user: {
  //           connect: {
  //             id: userId,
  //           },
  //         },
  //       },
  //       select: {
  //         id: true,
  //         completed: true,
  //         quantity: true,
  //         createdAt: true,
  //         user_id: true,
  //         user: {
  //           select: {
  //             name: true,
  //             email: true,
  //             phone: true,
  //           },
  //         },
  //         product: {
  //           select: {
  //             title: true,
  //             price: true,
  //             image: {
  //               select: {
  //                 url: true,
  //               },
  //             },
  //           },
  //         },
  //         contact: true,
  //         transactions: true,
  //         paypal_payments: true,
  //       },
  //     });

  //     if (!order) {
  //       throw new NotFoundException('Order not found');
  //     }
  //     if (order.user_id !== userId) {
  //       throw new NotFoundException('Order not found');
  //     }
  //     this.chatGateway.server.emit('order-create', {
  //       title: 'order created',
  //       data: `order of id ${order.id} was created by ${order.user.name} at ${order.createdAt}`,
  //     });

  //     this.mailingService.sendMail('orders', 'order', order);

  //     /* listen for order id and change completed to true */
  //     const orderComplete = this.chatGateway.server.on(
  //       'order-completed',
  //       (id: number) => {
  //         if (id === order.id) {
  //           this.prismaService.order.update({
  //             where: {
  //               id: order.id,
  //             },
  //             data: {
  //               completed: true,
  //             },
  //           });
  //         }
  //       },
  //     );
  //     console.log('order complete', orderComplete);
  //     const orderIsComplete = this.chatGateway.server.on(
  //       'order-Notcompleted',
  //       (id: number) => {
  //         if (id === order.id) {
  //           this.prismaService.order.update({
  //             where: {
  //               id: order.id,
  //             },
  //             data: {
  //               completed: true,
  //             },
  //           });
  //         }
  //       },
  //     );
  //     console.log('order complete', orderIsComplete);

  //     return order;
  //   }
  // }

  async createOrder(
    orderData: {
      userId: number;
      contactId: number;
      items: OrderItem[];
      paymentMethod?: PaymentMethod;
      paymentStatus?: PaymentStatus;
    },
    user: number,
  ): Promise<Order> {
    const {
      userId,
      contactId,
      items,
      paymentMethod = 'MPESA',
      paymentStatus = 'PENDING',
    } = orderData;

    // Fetch all product information for the given product IDs
    const productIds = items.map((item) => item.productId);
    const products = await this.prismaService.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });
    console.log('products', products);

    // Create a product map for quick product lookup by ID
    const productMap = {};
    products.forEach((product) => {
      productMap[product.id] = product;
    });
    console.log('productMap', productMap);

    // Calculate the total based on the fetched product prices and quantities
    let total = 0;
    items.forEach((item) => {
      const product = productMap[item.productId];
      if (product) {
        total += product.price * item.quantity;
      }
    });

    /* retrieve contactId with the user id*/
    const contactIdWithUserId = await this.prismaService.contact.findFirst({
      where: {
        user_id: user,
      },
    });
    console.log('contactIdWithUserId', contactIdWithUserId);

    // Create the order using Prisma's create method
    return this.prismaService.order.create({
      data: {
        total,
        user: {
          connect: {
            id: user, // Provide the user's id
          },
        },
        contact: {
          connect: {
            id: contactIdWithUserId.id, // Provide the contact's id
          },
        },
        items: {
          create: items.map((item) => ({
            quantity: item.quantity,
            product: {
              connect: {
                id: item.productId,
              },
            },
          })),
        },
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        quantity: items.reduce((acc, item) => acc + item.quantity, 0),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  // async updateOrder({ quantity }: CreateOrderDto, id: number, userId: number) {
  //   const order = await this.prismaService.order.findUnique({
  //     where: {
  //       id,
  //     },
  //     select: {
  //       id: true,
  //       user_id: true,
  //       completed: true,
  //       updatedAt: true,
  //       quantity: true,
  //       product: {
  //         select: {
  //           id: true,
  //           price: true,
  //           title: true,
  //           description: true,
  //           image: {
  //             select: {
  //               url: true,
  //             },
  //           },
  //         },
  //       },
  //     },
  //   });

  //   if (!order) {
  //     throw new NotFoundException('Order not found');
  //   }
  //   if (order.user_id !== userId) {
  //     throw new NotFoundException('Order not found');
  //   }

  //   const updatedOrder = await this.prismaService.order.update({
  //     where: {
  //       id,
  //     },
  //     data: {
  //       quantity: 0,
  //       completed: true,
  //     },
  //   });

  //   return updatedOrder;
  // }
  async updateOrder(
    orderId: number,
    updatedOrderData: Partial<Order>,
    userId: number,
  ): Promise<any> {
    // Fetch the existing order from the database using the orderId and userId
    console.log('orderId', orderId);

    if (!orderId) {
      throw new Error('Order ID not provided.');
    }
    const existingOrder = await this.prismaService.order.findUnique({
      where: {
        id: orderId,
      },
      select: {
        user_id: true,
        completed: true,
        delivered: true,
        payment_status: true,
        payment_method: true,
        quantity: true,
        total: true,
        items: {
          select: {
            product: {
              select: {
                id: true,
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
          },
        },
      },
    });

    if (!existingOrder) {
      throw new Error(
        `Order with ID ${orderId} for User ID ${userId} not found.`,
      );
    }
    const { user_id } = existingOrder;

    // Perform the update based on the provided fields in updatedOrderData
    if (user_id !== userId) {
      throw new Error(
        `Order with ID ${orderId} does not belong to User ID ${userId}.`,
      );
    }
    // const {
    //   payment_status,
    //   payment_method,
    //   completed,
    //   delivered,
    //   quantity,
    //   total,
    // } = updatedOrderData;

    const {
      payment_status,
      payment_method,
      completed,
      quantity,
      total,
      delivered,
    } = existingOrder;

    console.log('existingOrder', existingOrder);
    const updatedOrder = await this.prismaService.order.update({
      where: {
        id: orderId,
      },
      data: {
        payment_status: updatedOrderData.payment_status || payment_status,
        payment_method: updatedOrderData.payment_method || payment_method,
        completed: updatedOrderData.completed || completed,
        delivered: updatedOrderData.delivered || delivered,
        quantity: updatedOrderData.quantity || quantity,
        total: updatedOrderData.total || total,
      },
      select: {
        id: true,
        user_id: true,
        completed: true,
        quantity: true,
        contact: true,
        total: true,
        createdAt: true,
        updatedAt: true,
        payment_method: true,
        payment_status: true,
        delivered: true,
        items: {
          select: {
            id: true,
            orderId: true,
            product: true,
            quantity: true,
          },
        },
      },
    });
    console.log('updatedOrder', updatedOrder);

    // const updatedOrder = await this.prismaService.order.update({
    //   where: {
    //     id: orderId,
    //   },
    //   data: updatedOrderData,
    // });
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
        delivered: true,
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

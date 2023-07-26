import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductResponseDto, UpdateProductDto } from './dto/Product';
import {
  CreateProductParams,
  GetProductsParams,
  whichUser,
} from 'src/Utils.interfaces';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}
  async getProductsByPrice(maxPrice?: string, minPrice?: string) {
    const price =
      maxPrice || minPrice
        ? {
            ...(maxPrice && { lte: parseFloat(maxPrice) }),
            ...(minPrice && { gte: parseFloat(minPrice) }),
          }
        : undefined;
    const filters = {
      ...(price && { price }),
    };
    const response = await this.prismaService.product.findMany({
      where: {
        ...filters,
      },
      select: {
        id: true,
        price: true,
        title: true,
        description: true,
        categoryType: true,
        quantity: true,
        image: {
          select: {
            url: true,
          },
        },
      },
      take: 10,
    });

    if (!response.length) {
      throw new NotFoundException('No Products found');
    }
    if (response.length) {
      return response.map((Product) => {
        const fetchProduct = { ...Product, image: Product.image[0] };
        // delete fetchProduct.image[0];
        return fetchProduct;
      });
    }
    // return response.map((Product) => {

    //   const fetchProduct = { ...Product, image: Product.image[0] };
    //   delete fetchProduct.image[0];
    //   return fetchProduct;
    // });
    else {
      return response;
    }
  }
  async getProducts() {
    const response = await this.prismaService.product.findMany({
      select: {
        id: true,
        price: true,
        title: true,
        description: true,
        categoryType: true,
        quantity: true,
        image: {
          select: {
            url: true,
          },
        },
      },
      take: 10,
    });

    if (!response.length) {
      throw new NotFoundException('No Products found');
    }
    if (response.length) {
      return response.map((Product) => {
        const fetchProduct = { ...Product, image: Product.image[0] };
        // delete fetchProduct.image[0];
        return fetchProduct;
      });
    }
    // return response.map((Product) => {
    //   const fetchProduct = { ...Product, image: Product.image[0] };
    //   delete fetchProduct.image[0];
    //   return fetchProduct;
    // });
    else {
      return response;
    }
  }
  async getProduct(id: number) {
    const Product = await this.prismaService.product.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        price: true,
        title: true,
        description: true,
        categoryType: true,
        quantity: true,
        image: {
          select: {
            url: true,
          },
        },
        admin: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!Product) {
      throw new NotFoundException('Product not found');
    }

    return Product;
  }

  async createProduct(
    { price, categoryType, image, title, description }: CreateProductParams,
    userId: number,
  ) {
    const product = await this.prismaService.product.create({
      data: {
        categoryType,
        price,
        admin_id: userId,
        title,
        description,
      },
    });

    const ProductImages = image.map((image) => {
      return { ...image, product_id: product.id };
    });

    await this.prismaService.image.createMany({
      data: ProductImages,
    });

    return new ProductResponseDto(product);
  }

  /* add categories to categoryType */
  async updateProduct(id: number, body: UpdateProductDto) {
    /* find if id exist */
    const Product = await this.prismaService.product.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });
    if (!Product) {
      throw new NotFoundException('Product not found');
    }
    const updateProduct = await this.prismaService.product.update({
      where: {
        id,
      },
      data: {
        ...body,
      },
    });

    return new ProductResponseDto(updateProduct);
  }

  async deleteProduct(id: number) {
    const ProductImages = await this.prismaService.image.findMany({
      where: {
        product_id: id,
      },
      select: {
        id: true,
      },
    });
    if (!ProductImages.length) {
      throw new NotFoundException('Product not found');
    }
    if (ProductImages.length) {
      await this.prismaService.image.deleteMany({
        where: {
          product_id: id,
        },
      });

      /* find if id exist */
      const Product = await this.prismaService.product.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
        },
      });
      if (!Product) {
        throw new NotFoundException('Product not found');
      }
      await this.prismaService.product.delete({
        where: {
          id,
        },
      });
      return { message: 'Product deleted successfully' };
    }
  }

  async getAdminByProductId(id: number) {
    const Product = await this.prismaService.product.findUnique({
      where: {
        id: id,
      },
      select: {
        admin: {
          select: {
            name: true,
            id: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!Product) {
      throw new NotFoundException();
    }

    return Product.admin;
  }
  async inquire(buyer: whichUser, ProductId: number, message: string) {
    const realtor = await this.getAdminByProductId(ProductId);

    return this.prismaService.message.create({
      data: {
        admin_id: realtor.id,
        buyer_id: buyer.id,
        product_id: ProductId,
        message,
      },
    });
  }

  getMessagesByProduct(ProductId: number) {
    return this.prismaService.message.findMany({
      where: {
        product_id: ProductId,
      },
      select: {
        message: true,
        buyer: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });
  }
}

import { ProductsService } from './products.service';
import {
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  Query,
  ParseIntPipe,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CreateProductDto,
  ProductResponseDto,
  InquireDto,
  UpdateProductDto,
} from './dto/Product';
import { ApiTags, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { categoryType, UserType } from '@prisma/client';
import { User } from 'src/user/decorator/user.decorator';
import { whichUser } from 'src/Utils.interfaces';
import { Roles } from 'src/decorators/roles.decorators';

@ApiTags('product')
@Controller('product')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}
  /* search by price */
  @ApiOkResponse({ type: ProductResponseDto, isArray: true })
  @Get('/search')
  async searchByPrice(
    @Query('maxPrice') maxPrice?: string,
    @Query('minPrice') minPrice?: string,
  ): Promise<any[]> {
    return this.productService.getProductsByPrice(maxPrice, minPrice);
  }

  @ApiOkResponse({ type: ProductResponseDto, isArray: true })
  @Get()
  // async getProducts(
  //   @Query('title') title?: string,
  //   @Query('maxPrice') maxPrice?: string,
  //   @Query('minPrice') minPrice?: string,
  //   @Query('categoryType') categoryType?: categoryType,
  // ): Promise<ProductResponseDto[]> {
  //   const price =
  //     maxPrice || minPrice
  //       ? {
  //           ...(maxPrice && { lte: parseFloat(maxPrice) }),
  //           ...(minPrice && { gte: parseFloat(minPrice) }),
  //         }
  //       : undefined;
  //   const filters = {
  //     ...(title && { title }),
  //     ...(price && { price }),
  //     ...(categoryType && { categoryType }),
  //   };
  //   return this.productService.getProducts(filters);
  // }
  async getProducts() {
    return this.productService.getProducts();
  }

  @ApiOkResponse({ type: ProductResponseDto })
  @Get(':id')
  getProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getProduct(id);
  }

  @ApiCreatedResponse({ type: ProductResponseDto })
  @Roles(UserType.ADMIN)
  @Post()
  createProduct(@Body() body: CreateProductDto, @User() user: whichUser) {
    console.log('userId', user);

    return this.productService.createProduct(body, user.id);
  }

  @ApiOkResponse({ type: ProductResponseDto })
  @Roles(UserType.ADMIN)
  @Put(':id')
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductDto,
    // @User() user: whichUser,
  ) {
    // const admin = await this.productService.getAdminByProductId(id);
    // if (admin.id !== user.id) {
    //   throw new UnauthorizedException(
    //     'You are not authorized to update this Product',
    //   );
    // }

    return this.productService.updateProduct(id, body);
  }

  @ApiOkResponse({ type: ProductResponseDto })
  @Roles(UserType.ADMIN)
  @Delete(':id')
  async deleteProduct(@Param('id') id: number, @User() user: whichUser) {
    console.log('userId', user);
    // const admin = await this.productService.getAdminByProductId(id);
    // if (admin.id !== user.id) {
    //   throw new UnauthorizedException(
    //     'You are not authorized to delete this Product',
    //   );
    // }
    return this.productService.deleteProduct(id);
  }
  @ApiOkResponse()
  @Roles(UserType.BUYER)
  @Post('/:id/inquire')
  inquire(
    @Param('id', ParseIntPipe) ProductId: number,
    @User() user: whichUser,
    @Body() { message }: InquireDto,
  ) {
    return this.productService.inquire(user, ProductId, message);
  }

  @ApiOkResponse()
  @Roles(UserType.ADMIN)
  @Get('/:id/messages')
  async getProductMessages(
    @Param('id', ParseIntPipe) id: number,
    @User() user: whichUser,
  ) {
    const admin = await this.productService.getAdminByProductId(id);

    if (admin.id !== user.id) {
      throw new UnauthorizedException();
    }

    return this.productService.getMessagesByProduct(id);
  }

  /* create categories */
  // @ApiOkResponse()
  // @Roles(UserType.ADMIN)
  // @Post('/category')
  // async createCategory(
  //   @Body() body: { name: string },
  //   @User() user: whichUser,
  // ) {
  //   return this.productService.createCategory(body, user.id);
  // }

  // @ApiOkResponse()
  // @Roles(UserType.ADMIN)
  // @Delete('/category/:id')
  // async deleteCategory(
  //   @Param('id', ParseIntPipe) id: number,
  //   @User() user: whichUser,
  // ) {
  //   return this.productService.deleteCategory(id, user.id);
  // }
}

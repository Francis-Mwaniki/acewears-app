import { categoryType } from '.prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

export interface Category {
  id: number;
  name: string;
}
export class ProductResponseDto {
  id: number;
  title: string;

  CategoryType: categoryType;

  price: number;

  image: string;

  @Exclude()
  created_at: Date;
  @Exclude()
  updated_at: Date;
  @Exclude()
  admin_id: number;

  constructor(partial: Partial<ProductResponseDto>) {
    Object.assign(this, partial);
  }
}

class Image {
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsPositive()
  price: number;
  @IsNotEmpty()
  categoryType: categoryType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Image)
  image: Image[];

  @IsOptional()
  @IsEnum(categoryType)
  category?: Category;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  address?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  numberOfBedrooms?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  numberOfBathrooms?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  landSize?: number;

  @IsOptional()
  @IsEnum(categoryType)
  categoryType?: categoryType;
}

export class InquireDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}

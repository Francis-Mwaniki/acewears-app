import { UserType } from '.prisma/client';
import {
  Controller,
  Post,
  Body,
  Param,
  ParseEnumPipe,
  UnauthorizedException,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcryptjs';
import { GenerateProductKeyDto, SignInDto, SignUpDto } from 'src/dtos/auth.dto';
import { ApiTags, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { whichUser } from 'src/Utils.interfaces';
import { User } from '../decorator/user.decorator';
import { Roles } from 'src/decorators/roles.decorators';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiCreatedResponse({ type: SignUpDto })
  @Post('signup/:userType')
  async signup(
    @Body() body: SignUpDto,
    @Param('userType', new ParseEnumPipe(UserType)) userType: UserType,
  ) {
    if (userType !== UserType.BUYER) {
      if (!body.productKey) {
        throw new UnauthorizedException('Product key is required');
      }
      const validProductKey = `${body.email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;

      const isProductKeyValid = await bcrypt.compare(
        validProductKey,
        body.productKey,
      );

      if (!isProductKeyValid) {
        throw new UnauthorizedException('Invalid product key');
      }
    }

    return this.authService.signup(body, userType);
  }

  @ApiCreatedResponse({ type: SignInDto })
  @Post('signin')
  async signin(@Body() body: SignInDto) {
    return this.authService.signin(body);
  }

  @ApiOkResponse({ type: GenerateProductKeyDto })
  @Post('/key')
  generateProductKey(@Body() { userType, email }: GenerateProductKeyDto) {
    return this.authService.generateProductKey(email, userType);
  }

  @ApiOkResponse({ type: 'User Profile' })
  @Roles(UserType.BUYER, UserType.ADMIN)
  @Get('/me')
  async me(@User() user: whichUser) {
    return this.authService.me(user.id);
  }
}

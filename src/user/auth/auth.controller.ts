import { UserType } from '.prisma/client';
import {
  Controller,
  Post,
  Body,
  Param,
  ParseEnumPipe,
  UnauthorizedException,
  Get,
  Delete,
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
  @Roles(UserType.ADMIN)
  @Post('/key')
  generateProductKey(
    @Body() { userType, email }: GenerateProductKeyDto,
    @User() user: whichUser,
  ) {
    return this.authService.generateProductKey(email, userType, user.id);
  }

  @ApiOkResponse({ type: 'User Profile' })
  @Roles(UserType.BUYER, UserType.ADMIN)
  @Get('/me')
  async me(@User() user: whichUser) {
    return this.authService.me(user.id);
  }

  @ApiOkResponse({ type: 'forgot password' })
  @Post('/forgot-password')
  async forgotPassword(@Body() { email }: { email: string }) {
    return this.authService.forgotPassword(email);
  }
  @ApiOkResponse({ type: 'update password' })
  // @Roles(UserType.BUYER, UserType.ADMIN)
  @Post('/update-password')
  async updatePassword(
    @User() user: whichUser,
    @Body() { password, token }: { password: string; token: string },
  ) {
    return this.authService.updatePassword(user.id, password, token);
  }

  /* delete user account */
  @ApiOkResponse({ type: 'delete user account' })
  @Roles(UserType.BUYER, UserType.ADMIN)
  @Delete('/delete-account')
  async deleteAccount(@User() user: whichUser) {
    return this.authService.deleteAccount(user.id);
  }
}

import { ConflictException, HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpParams } from 'src/Utils.interfaces';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { SignInDto } from 'src/dtos/auth.dto';
import { UserType } from '@prisma/client';
import { ChatGateway } from 'src/chat/chat.gateway';
import { MailingService } from 'src/mailing/mailing.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly chatGateway: ChatGateway,
    private readonly mailingService: MailingService,
  ) {}
  async signup(
    { name, phone, email, password }: SignUpParams,
    userType: UserType,
  ) {
    // does user exist?
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (user) {
      throw new ConflictException('User already exists');
    }
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const newUser = await this.prismaService.user.create({
      data: {
        name,
        phone,
        email,
        password: hashedPassword,
        user_type: userType,
      } as any,
    });
    const token = this.generateToken(newUser.name, newUser.id);
    this.chatGateway.server.emit('user', {
      title: 'new user',
      data: `${newUser.name} signed up`,
    });
    this.mailingService.sendMail('Welcome', newUser.email, 'welcome', {
      name: newUser.name,
      email: newUser.email,
    });
    // return user
    return { user: newUser, token };
  }
  async signin({ email, password }: SignInDto) {
    // does user exist?
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new HttpException('Invalid credentials', 400);
    }
    // check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', 400);
    }
    const token = this.generateToken(user.name, user.id);
    // return user
    return { user, token };
  }

  private generateToken(name: string, id: number | string) {
    return jwt.sign({ name, id }, process.env.JSON_TOKEN_KEY, {
      expiresIn: '1d',
    });
  }

  async generateProductKey(email: string, userType: UserType, id: number) {
    const stringKey = `${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;
    try {
      const key: string = (await bcrypt.hash(stringKey, 10)).toString();

      const proDkey = await this.prismaService.productKey.create({
        data: {
          key: key,
          email,
          user_id: id,
        },
        select: {
          key: true,
          email: true,
        },
      });
      const userKey = proDkey.key;
      console.log('userKey', userKey);
      /* generate product and send to the email */
      this.mailingService
        .sendMail('Product Key', email, 'product-key', {
          key: userKey,
          email,
        })
        .catch((error) => {
          console.error('Failed to send the email:', error);
        });
    } catch (error) {
      throw new HttpException('Error generating product key', 500);
    }
    return { message: 'Product key generated successfully, check ' };
  }
  /* profile of user */
  async me(id: number) {
    console.log('id', id);

    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        user_type: true,
        created_at: true,
        updated_at: true,
        orders: {
          select: {
            id: true,
            quantity: true,
            completed: true,
          },
        },
        products: {
          select: {
            id: true,
            title: true,
            image: {
              select: {
                id: true,
                url: true,
              },
            },
            price: true,
            description: true,
            created_at: true,
            updated_at: true,
          },
        },
      },
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    return user;
  }

  async updatePassword(id: number, password: string, token: string) {
    const tokenData = jwt.verify(token, process.env.JSON_TOKEN_KEY);
    if (!tokenData) {
      throw new HttpException('Invalid token', 400);
    }
    const { id: userId } = tokenData as any;
    console.log('userId', userId);
    if (userId !== id) {
      throw new HttpException('Invalid token', 400);
    }

    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      throw new HttpException('Password cannot be the same', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });

    return { message: 'Password updated successfully' };
  }
  async forgotPassword(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    const token = this.generateToken(user.name, user.id);

    this.mailingService.sendMail(
      'Reset Password',
      user.email,
      'reset-password',
      {
        name: user.name,
        email: user.email,
        token,
      },
    );

    return {
      message: 'Check your email for password reset link',
      token: token,
    };
  }
  async deleteAccount(id: number) {
    console.log('userId', id);

    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    await this.prismaService.user.delete({
      where: { id },
    });

    return { message: 'Account deleted successfully' };
  }
}

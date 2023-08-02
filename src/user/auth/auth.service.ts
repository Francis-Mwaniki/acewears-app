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

  async generateProductKey(email: string, userType: UserType) {
    const string = `${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;

    return bcrypt.hash(string, 10);
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
}

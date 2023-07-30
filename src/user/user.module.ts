import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ChatGateway } from 'src/chat/chat.gateway';
import { MailingService } from 'src/mailing/mailing.service';

@Module({
  imports: [PrismaModule, ChatGateway],
  controllers: [AuthController],
  providers: [AuthService, ChatGateway, MailingService],
})
export class UserModule {}

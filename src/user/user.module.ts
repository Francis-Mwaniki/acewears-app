import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ChatGateway } from 'src/chat/chat.gateway';

@Module({
  imports: [PrismaModule, ChatGateway],
  controllers: [AuthController],
  providers: [AuthService, ChatGateway],
})
export class UserModule {}

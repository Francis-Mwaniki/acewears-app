import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
export class UserInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, handler: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const token = request?.headers?.authorization?.split('Bearer ')[1];
    if (token) {
      const user = jwt.decode(token);
      request.user = user;
      console.log('request.user', request.user);
    }

    return handler.handle();
  }
}

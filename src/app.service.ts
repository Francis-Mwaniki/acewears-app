import { Injectable, Redirect } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return 'Hello World!';
  }
}

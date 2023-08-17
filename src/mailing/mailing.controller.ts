import { Controller, Get } from '@nestjs/common';
import { MailingService } from './mailing.service';

@Controller('mailing')
export class MailingController {
  constructor(readonly mailingService: MailingService) {}
  @Get()
  public sendMail() {
    const mail = {
      to: 'francismwaniki630@gmail.com',
      subject: 'Hello from sendgrid',
      from: 'acewearske@gmail.com', // Fill it with your validated email on SendGrid account
      text: 'Hello',
      html: '<h1>Hello</h1>',
    };
    this.mailingService.send(mail);
  }
}

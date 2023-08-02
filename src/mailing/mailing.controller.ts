import { Controller, Get } from '@nestjs/common';
import { MailingService } from './mailing.service';

@Controller('mailing')
export class MailingController {
  constructor(readonly mailingService: MailingService) {}
  @Get()
  public sendMail() {
    this.mailingService.sendMail(
      'test',
      'francismwaniki630@gmail.com',
      'action',
      { code: 'test' },
    );
  }
}

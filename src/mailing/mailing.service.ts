import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';

@Injectable()
export class MailingService {
  constructor(private readonly configService: ConfigService) {
    // Don't forget this one.
    // The apiKey is required to authenticate our
    // request to SendGrid API.
    SendGrid.setApiKey(
      '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',
    );
  }

  public async send(mail: SendGrid.MailDataRequired) {
    const transport = await SendGrid.send(mail);
    // avoid this on production. use log instead :)
    console.log(`E-Mail sent to ${mail.to}`);
    return transport;
  }
}

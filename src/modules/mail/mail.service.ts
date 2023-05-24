import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendNewsUpdate(emails: string[], newsDifference) {
    for (const email of emails) {
      await this.mailerService
        .sendMail({
          to: email,
          subject: 'Новость изменена',
          template: './news-update',
          context: newsDifference,
        })
        .then((res) => {
          return res;
        })
        .catch((err) => {
          return err;
        });
    }
  }
}

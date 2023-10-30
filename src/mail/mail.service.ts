import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.MAILER_SERVICE,
      auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASSWORD,
      },
    });
  }

  async sendMail(mailReceiver: string, mailSubject: string, mailText: string) {
    const mailOptions = {
      from: process.env.MAILER_USER,
      to: mailReceiver,
      subject: mailSubject,
      text: mailText,
    };

    await this.transporter.sendMail(mailOptions);
  }
}

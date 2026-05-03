import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createTransport, type Transporter, type SendMailOptions } from 'nodemailer';

export interface SendMailParams {
  to: string | string[];
  subject: string;
  html?: string;
  from?: string;
}

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter!: Transporter;
  private defaultFrom?: string;

  onModuleInit() {
    const host = process.env.MAIL_HOST;
    const port = Number(process.env.MAIL_PORT ?? 587);
    const secure = process.env.MAIL_SECURE === 'true';
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;
    this.defaultFrom = process.env.MAIL_FROM;

    this.transporter = createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });

    this.logger.log(`Mail transporter ready (${host}:${port}, secure=${secure})`);
  }

  async sendMail(params: SendMailParams) {
    const options: SendMailOptions = {
      from: params.from ?? this.defaultFrom,
      to: params.to,
      subject: params.subject,
      html: params.html,
    };
    return this.transporter.sendMail(options);
  }
}

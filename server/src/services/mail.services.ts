import { injectable } from 'inversify';
import { IMailService } from '../core/interfaces/services/IMailService';
import { MailUtil } from '../utils/mail.util';
import dotenv from 'dotenv'
dotenv.config()

@injectable()
export class MailService implements IMailService {
  private mailUtil: MailUtil;

  constructor() {
    this.mailUtil = new MailUtil();
    this.validateEnv();
  }

  private validateEnv(): void {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Mail service configuration incomplete: Missing email credentials.');
    }
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      const result = await this.mailUtil.send(to, subject, html);
      return result;
    } catch (error) {
      throw new Error('Mail delivery failed');
    }
  }
}

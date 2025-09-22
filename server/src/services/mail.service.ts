import { injectable } from 'inversify';
import { IMailService } from '../core/interfaces/services/IMailService';
import { MailUtil } from '../utils/mail.util';
import dotenv from 'dotenv';
import { MESSAGES } from '../constants/messages';

dotenv.config();

@injectable()
export class MailService implements IMailService {
  private _mailUtil: MailUtil;

  constructor() {
    this._mailUtil = new MailUtil();
    this.validateEnv();
  }

  private validateEnv(): void {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error(MESSAGES.MAIL_CONFIG_INCOMPLETE);
    }
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this._mailUtil.send(to, subject, html);
    } catch (err) {
      const error = err as Error;
      throw new Error(error.message || MESSAGES.MAIL_DELIVERY_FAILED);
    }
  }
}
import { injectable } from 'inversify'
import { IMailService } from '../core/interfaces/services/IMailService'
import { MailUtil } from '../utils/mail.util'
import dotenv from 'dotenv'
import { MESSAGES } from '../constants/messages'
import { AppError } from '../utils/appError.util'
import { STATUS_CODE } from '../constants/status'
import { dailyWorkoutReminderHtml, getReminderHtml, gymSubscriptionHtml } from '../utils/sendEmail'
import { MAIL_CONSTANTS } from '../constants/mail.constants'

dotenv.config()

@injectable()
export class MailService implements IMailService {
  private _mailUtil: MailUtil

  constructor () {
    this._mailUtil = new MailUtil()
    this.validateEnv()
  }

  private validateEnv (): void {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new AppError(
        MESSAGES.MAIL_CONFIG_INCOMPLETE,
        STATUS_CODE.INTERNAL_SERVER_ERROR
      )
    }
  }

  async sendMail (to: string, subject: string, html: string): Promise<void> {
    try {
      await this._mailUtil.send(to, subject, html)
    } catch (err) {
      const error = err as Error
      throw new AppError(
        error.message || MESSAGES.MAIL_DELIVERY_FAILED,
        STATUS_CODE.INTERNAL_SERVER_ERROR
      )
    }
  }
  async sendReminderMail (to: string, message: string): Promise<void> {
    const html = getReminderHtml(message)
    await this.sendMail(to, MAIL_CONSTANTS.REMINDER_SUBJECT, html)
  }

  async sendGymSubscriptionEmail (
    userEmail: string,
    userName: string,
    gymName: string,
    planName: string,
    preferredTime: string
  ): Promise<void> {
    const html = gymSubscriptionHtml(userName, gymName, planName, preferredTime)
    await this.sendMail(
      userEmail,
      `🎉 Welcome to ${gymName}! Your Subscription is Confirmed`,
      html
    )
  }

  async sendDailyWorkoutReminder (
    userEmail: string,
    userName: string,
    gymName: string
  ): Promise<void> {
    const html = dailyWorkoutReminderHtml(userName, gymName)
    await this.sendMail(
      userEmail,
      `🏋️‍♂️ Time for Your Daily Workout at ${gymName}!`,
      html
    )
  }
}

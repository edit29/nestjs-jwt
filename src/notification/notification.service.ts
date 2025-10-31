import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private token?: string;
  private apiBase?: string;

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (token) {
      this.token = token;
      this.apiBase = `https://api.telegram.org/bot${token}`;
      this.logger.log('Настроен Telegram-бот');
    } else {
      this.logger.warn('Telegram-бот не настроен. Установите для TELEGRAM_BOT_TOKEN значение');
    }
  }

  /**
   * Send a Telegram message via Bot API. `username` should be like `@channel` or `@username`.
   * Note: bots cannot message arbitrary users unless the user has started the bot; sending to @username works for channels / public groups where the bot is a member/admin.
   */
  async sendTelegram(username: string, text: string) {
    if (!this.apiBase) {
      this.logger.log(`(stub) Sending Telegram to ${username}: ${text}`);
      return { success: true, stub: true, username };
    }

    const chat_id = username;

    try {
      const res = await axios.post(`${this.apiBase}/sendMessage`, {
        chat_id,
        text,
        parse_mode: 'HTML',
      });
      this.logger.log(`Telegram message sent: ok=${res.data.ok}`);
      return { success: true, result: res.data };
    } catch (err: any) {
      this.logger.error('Error sending Telegram message', err?.response?.data ?? err.message ?? err);
      return { success: false, error: err?.response?.data ?? err.message ?? err };
    }
  }
}

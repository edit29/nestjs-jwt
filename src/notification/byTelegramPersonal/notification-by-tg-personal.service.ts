import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { InlineKeyboardButtonDto } from './dto/notification-by-tg-pres-dto';

@Injectable()
export class NotificationByTgPersonalService {
  private readonly logger = new Logger(NotificationByTgPersonalService.name);
  private token?: string;
  private apiBase?: string;
  private adminChatId?: string;

  constructor(private readonly configService: ConfigService) {
  }

  /**
   * Send order notification to admin's personal Telegram with reply buttons
   */
  async notifyOrderCreated(user, order: any) {

    // Get your personal bot token and your chat_id from config
    const token = '8520259904:AAHW8f0GC2lsEwAgkQSZmCHduv_Yj7SeFV4';
    const adminChatId = '994409574';

    if (token) {
      this.token = token;
      this.apiBase = `https://api.telegram.org/bot${token}`;
      this.adminChatId = adminChatId;
      this.logger.log('Настроен персональный Telegram-бот администратора');
    } else {
      this.logger.warn('Персональный Telegram-бот не настроен. Установите TELEGRAM_ADMIN_BOT_TOKEN и TELEGRAM_ADMIN_CHAT_ID');
    }

    if (!this.apiBase || !this.adminChatId) {
      this.logger.warn('Персональный бот не настроен - пропускаем уведомление');
      return { success: false, reason: 'not_configured' };
    }

    // Format order details with Markdown
    const escapeMarkdown = (s: any) => 
      (s === undefined || s === null) ? '' : String(s)
        .replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&'); // Экранируем специальные символы Markdown

    const lines = order.items?.map((i: any) => 
      `📦 *${escapeMarkdown(i.name)}*\n` +
      `   ${escapeMarkdown(i.quantity)}шт × ${escapeMarkdown(i.price)}₽`
    ) ?? [];

    const contactInfo: string[] = [];
    if (user?.phone) {
      const phone = user.phone.replace(/[^0-9+]/g, '');
      contactInfo.push(`📱 Телефон: [${escapeMarkdown(user.phone)}](tel:${phone})`);
    }
    if (user?.telegramUsername) {
      contactInfo.push(`📲 Telegram: [@${escapeMarkdown(user.telegramUsername)}](https://t.me/${user.telegramUsername})`);
    }

    const message = [
        `🛍 *Новый заказ \\#${escapeMarkdown(order.id)}*`,
        '',
        ...contactInfo,
        '',
        '*Товары:*',
        ...lines,
        '',
        `💰 *Итого:* ${escapeMarkdown(order.total)}₽`,
        `📅 *Дата:* ${escapeMarkdown(new Date().toLocaleString('ru'))}`,

        // `<b></b>`,

//         `<b>*Здравствуйте,  🥂*</b>`,
//         `<b>_Ваш заказ успешно принят_ ✅</b>`,
//         `<b>💰 *Сумма заказа: ${escapeHtml(order.total)}* </b>`,
//         `<b>📄 *Реквизиты для оплаты:*</b>`,
//         `<b>⚠️Переводите ровную сумму как в заказе! </b>`,
//         `<b>В комментарии к переводу *ничего не указывайте!* </b>`,
//         `<b></b>`,
//         `<b>Перевод по номеру карты на удобный для вас банк: </b>`,
//         `<b></b>`,
//         `<b>💳 *2200 700736078485* </b>`,
//         `<b>👤 *Андрей Г. (Т-Банк)* </b>`,
//         `<b></b>`,
//         `<b>После оплаты обязательно *пришлите чек об оплате* — только после его получения мы начнём сборку и передадим заказ курьеру 🚚 </b>`,
//         `<b></b>`,
//         `<b>⏱️ *Срок доставки:* от 20 минут (в зависимости от удалённости вашего адреса). 
// Если выбран *экспресс-вариант* — курьер привезёт ваш заказ заметно быстрее 🛵 </b>`,
//         `<b>🔞 *Важно:*</b>`,
//         `<b>Курьер может запросить документ, подтверждающий возраст 18+. </b>`,
//         `<b>Если возраст не подтверждён — доставка невозможна.</b>`,

    ].filter(Boolean).join('\n');

    // Add inline buttons to quickly reply or view details
    const buttons: InlineKeyboardButtonDto[][] = [];
    
    // Button to open chat if we have customer's username
    if (user?.telegramUsername) {
      buttons.push([{
        text: '💬 Написать клиенту в тг',
        url: `https://t.me/${user.telegramUsername}`,
      }]);
    }
    if (user?.phone) {
      buttons.push([{
        text: '💬 Написать клиенту в Ватсап',
        url: `https://wa.me/${user.phone}`,
      }]);
    }

    // Add button to insert template text into chat
    buttons.push([{
      text: '📋 Ответить клиенту',
      switch_inline_query_current_chat: [
            `*Здравствуйте,  🥂*`,
            `_Ваш заказ успешно принят_ ✅`,
            `💰 *Сумма заказа: ${escapeMarkdown(order.total)}*`,
            `📄 *Реквизиты для оплаты: `,
            `⚠️Переводите ровную сумму как в заказе!`,
            `В комментарии к переводу *ничего не указывайте!*`,
            ``,
            `Перевод по номеру карты на удобный для вас банк:`,
            ``,
            `💳 *2200 700736078485*`,
            `👤 *Андрей Г. (Т-Банк)*`,
            ``,
            `После оплаты обязательно *пришлите чек об оплате* — только после его получения мы начнём сборку и передадим заказ курьеру 🚚`,
            ``,
            `⏱️ *Срок доставки:* от 20 минут (в зависимости от удалённости вашего адреса). 
     Если выбран *экспресс-вариант* — курьер привезёт ваш заказ заметно быстрее 🛵`,
            `🔞 *Важно:*`,
            `Курьер может запросить документ, подтверждающий возраст 18+.`,
            `Если возраст не подтверждён — доставка невозможна.`,
      ].join('\n')
    }]);

      try {
      const res = await axios.post(`${this.apiBase}/sendMessage`, {
        chat_id: this.adminChatId,
        text: message,
        parse_mode: 'MarkdownV2',
        reply_markup: buttons.length ? {
          inline_keyboard: buttons,
        } : undefined,
      });      this.logger.log(`Уведомление о заказе отправлено: ok=${res.data.ok}`);
      return { success: true, result: res.data };
    } catch (err: any) {
      this.logger.error('Ошибка отправки уведомления', err?.response?.data ?? err.message ?? err);
      return { success: false, error: err?.response?.data ?? err.message ?? err };
    }
  }

  /**
   * Send a message to customer and get notified about replies
   */
  async sendCustomerMessage(customerUsername: string, text: string) {
    if (!this.apiBase) {
      this.logger.warn('Бот не настроен - пропускаем сообщение');
      return { success: false, reason: 'not_configured' };
    }

    try {
      // First, try to send to customer
      const toCustomer = await axios.post(`${this.apiBase}/sendMessage`, {
        chat_id: `@${customerUsername}`,
        text,
        parse_mode: 'HTML',
      });

      // If sent to customer successfully and we have admin chat, notify admin
      if (toCustomer.data.ok && this.adminChatId) {
        await axios.post(`${this.apiBase}/sendMessage`, {
          chat_id: this.adminChatId,
          text: `✅ Сообщение отправлено @${customerUsername}:\n\n${text}`,
          parse_mode: 'HTML',
        });
      }

      return { success: true, result: toCustomer.data };
    } catch (err: any) {
      this.logger.error('Ошибка отправки сообщения', err?.response?.data ?? err.message ?? err);
      return { success: false, error: err?.response?.data ?? err.message ?? err };
    }
  }
}

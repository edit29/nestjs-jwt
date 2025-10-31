import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // clear module registry
    process.env = { ...OLD_ENV };
    // Ensure Telegram env var is unset to force stub path
    delete process.env.TELEGRAM_BOT_TOKEN;
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('должен возвращать результат заглушки, если Telegram не настроен', async () => {
    const svc = new NotificationService();
    const res = await svc.sendTelegram('@example_user', 'test message');
    expect(res).toHaveProperty('success', true);
    expect(res).toHaveProperty('stub', true);
    expect(res).toHaveProperty('username', '@example_user');
  });
});

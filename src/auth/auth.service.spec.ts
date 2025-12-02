import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { createHash, createHmac } from 'crypto';

describe('AuthService - telegramLogin', () => {
  let authService: AuthService;
  const botToken = 'test_bot_token_123';

  const mockPrisma: any = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    phoneVerification: {
      create: jest.fn(),
      findFirst: jest.fn(),
    }
  };

  const mockJwtService: any = {
    sign: jest.fn().mockReturnValue('signed-token'),
    verifyAsync: jest.fn(),
  };

  const mockConfig: any = {
    getOrThrow: jest.fn((key: string) => {
        switch(key){
        case 'JWT_SECRET_KEY': return 'jwt_secret';
        case 'JWT_ACCESS_TOKEN_TTL': return '2h';
        case 'JWT_REFRESH_TOKEN_TTL': return '7d';
        case 'COOKIE_DOMAIN': return 'localhost';
        case 'NODE_ENV': return 'developments';
        default: throw new Error('missing');
      }
    }),
    get: jest.fn((k: string) => {
      if (k === 'TELEGRAM_BOT_TOKEN') return botToken;
      return undefined;
    })
  };

  beforeEach(() => {
    mockPrisma.user.findUnique.mockReset();
    mockPrisma.user.create.mockReset();
    mockPrisma.user.update.mockReset();

    authService = new AuthService(mockPrisma as any, mockConfig as any, mockJwtService as any);
  });

  it('should create a new user and return access token for valid telegram payload', async () => {
    // prepare payload
    const payload: any = {
      id: '555000111',
      first_name: 'John',
      last_name: 'Doe',
      username: 'johnd',
      auth_date: Math.floor(Date.now() / 1000),
    };

    // compute hash using same algorithm as service
    const data = { ...payload };
    const keys = Object.keys(data).sort();
    const dataCheckString = keys.map(k => `${k}=${data[k]}`).join('\n');
    const secretKey = createHash('sha256').update(botToken).digest();
    const hmac = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
    payload.hash = hmac;

    // make prisma return null (no existing user) then created user
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: 'u1', name: 'John Doe', telegramUsername: 'johnd' });

    const res: any = { cookie: jest.fn() };

    const result = await authService.telegramLogin(res as any, payload);

    expect(result).toHaveProperty('accessToken');
    expect(mockPrisma.user.create).toHaveBeenCalled();
    expect(res.cookie).toHaveBeenCalled();
  });

  it('should throw UnauthorizedException for invalid hash', async () => {
    const payload: any = {
      id: '1',
      first_name: 'Bad',
      username: 'bad',
      auth_date: Math.floor(Date.now() / 1000),
      hash: 'invalidhash',
    };

    const res: any = { cookie: jest.fn() };
    await expect(authService.telegramLogin(res as any, payload)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

import { ConflictException, Injectable, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterRequest } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { hash } from 'argon2';
import { PhoneAuthService } from '../phone-auth/phone-auth.service';
import { JwtService } from '@nestjs/jwt'
import type { JwtPayload } from './interfaces/jwt.interface';
import { LoginRequest } from './dto/login.dto';
import { verify } from 'argon2';
import type { Response } from 'express';
import type { Request} from 'express';
import { isDev } from '../utilities/is-dev.util';
import { randomInt } from 'crypto';
import { createHmac, createHash } from 'crypto';

@Injectable()
export class AuthService {
    private readonly JWT_SECRET: string;
    private readonly JWT_ACCESS_TOKEN_TTL: string;
    private readonly JWT_REFRESH_TOKEN_TTL: string;

    private readonly COOKIE_DOMAIN: string;
    
    private readonly logger = new Logger(AuthService.name);

    constructor(private readonly prismaService: PrismaService, 
                private readonly configService: ConfigService,
                private readonly jwtService: JwtService,
                ){
                    this.JWT_SECRET = configService.getOrThrow<string>('JWT_SECRET_KEY');
                    this.JWT_ACCESS_TOKEN_TTL = configService.getOrThrow<string>('JWT_ACCESS_TOKEN_TTL');
                    this.JWT_REFRESH_TOKEN_TTL = configService.getOrThrow<string>('JWT_REFRESH_TOKEN_TTL');
                    this.COOKIE_DOMAIN = configService.getOrThrow<string>('COOKIE_DOMAIN');
                }
    
    async register(res: Response, dto: RegisterRequest){
        const { name, email, password, phone } = dto;

        const existByEmail = await this.prismaService.user.findUnique({ where: { email } });
        if (existByEmail) {
            throw new ConflictException('Пользователь с почтой уже существует');
        }

        const existByPhone = phone ? await this.prismaService.user.findUnique({ where: { phone } }) : null;
        if (existByPhone) {
            throw new ConflictException('Пользователь с таким телефоном уже существует');
        }

        // Hash password and send a verification code with registration payload.
        const hashed = await hash(password);
        const user = await this.sendCode(phone, { email, name, password: hashed });
        this.logger.log(`Verification code was sent`)
        return `Verification code was sent`;

        // return this.auth(res, user.id);
    }
    async login(res: Response, dto: LoginRequest){
        const { email, password } = dto;

        const user = await this.prismaService.user.findUnique({
            where: {
                email,
            },
            select: {
                id: true,
                password: true,
            },
        });

        if (!user) {
            throw new NotFoundException('Пользователь не найден');
        }

        if (!user.password) {
            throw new NotFoundException('Пользователь не найден');
        }

        const isValidPassword = await verify(user.password, password);

        if(!isValidPassword){
            throw new NotFoundException('Пользователь не найден');
        }

        return this.auth(res, user.id);
    }

    async refresh(req: Request, res: Response){
        const refreshToken = req.cookies['refreshToken'];
        console.log(`Refresh Token is ${refreshToken}`);

        if(!refreshToken){
            throw new UnauthorizedException('Недействительный refresh-токен');
        }
        
        const payload: JwtPayload = await this.jwtService.verifyAsync(refreshToken, {
            secret: this.configService.getOrThrow<string>("JWT_SECRET_KEY"), // как ты получаешь секретный ключ
        });

        if(payload){
            const user = await this.prismaService.user.findUnique({
                where: {
                    id: payload.id,
                },
                select: {
                    id: true,
                },
            });

            if (!user) {
                throw new NotFoundException('Пользователь не найден');
            }

            return this.auth(res, user.id);
        }
    }

    async logout(res: Response){
        this.setCookie(res, 'refreshToken', new Date(0));
        return `Logout complete`;
    }

    async validate(id: string){
        const user = await this.prismaService.user.findUnique({
            where:{
                id
            }
        });

        if(!user){
            throw new NotFoundException('Пользователь не найден');
        }
        return user;
    }
я
    // Public wrapper to authenticate by user id and set cookies — used by alternative auth flows
    async authById(res: Response, id: string){
        return this.auth(res, id);
    }

    async sendCode(phone: string, payload?: { email?: string; name?: string; password?: string }) {
        const code = String(randomInt(100000, 999999));
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
        // Store optional registration payload (password should already be hashed by caller)
        const user = await this.prismaService.phoneVerification.create({
          data: {
            phone,
            code,
            expiresAt,
            email: payload?.email,
            name: payload?.name,
            password: payload?.password,
          },
        });
    
        // TODO: integrate with SMS provider (Twilio) to send the code; for now just log
        this.logger.log(`Verification code for ${phone}: ${code}`);
        return user;
      }

    async verifyCode(phone: string, code: string) {
    const record = await this.prismaService.phoneVerification.findFirst({ where: { phone, code }, orderBy: { createdAt: 'desc' } });
    if (!record) return null;
    if (record.expiresAt < new Date()) return null;

    // Remove used codes
    await this.prismaService.phoneVerification.deleteMany({ where: { phone } });

    // If a user with this phone already exists, mark verified and return
    let user = await this.prismaService.user.findUnique({ where: { phone } });
    if (user) {
      await this.prismaService.user.update({ where: { id: user.id }, data: { phoneVerified: true } });
      user = await this.prismaService.user.findUnique({ where: { id: user.id } });
      return user;
    }

    

    // If the verification record contains registration payload, create user with that data
    if (record.email || record.password) {
      const createData: any = {
        phone,
        phoneVerified: true,
        name: record.name ?? record.email ?? phone,
      };
      if (record.email) createData.email = record.email;
      if (record.password) createData.password = record.password; // already hashed by caller

      user = await this.prismaService.user.create({ data: createData });
      return user;
    }

    // Fallback: create a simple user with phone as name
    user = await this.prismaService.user.create({ data: { phone, name: phone, phoneVerified: true } });
    return user;
  }

    /**
     * Authenticate or register a user using Telegram Login Widget data.
     * Expects the full payload received from Telegram (id, first_name, last_name, username, auth_date, hash, ...)
     */
    async telegramLogin(res: Response, payload: Record<string, any>){
        const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN') || process.env.TELEGRAM_BOT_TOKEN;
        if(!botToken) throw new UnauthorizedException('Telegram bot token is not configured');

        const ok = this.verifyTelegramAuth(payload, botToken);
        if(!ok) throw new UnauthorizedException('Invalid Telegram login data');

        const incomingId = String(payload.id);

        // try to find existing user by telegramId
        let user = await (this.prismaService as any).user.findUnique({ where: { telegramId: incomingId } });

        if(!user){
            const name = payload.username ?? (`${payload.first_name ?? ''} ${payload.last_name ?? ''}`.trim() || `telegram_${incomingId}`);
            user = await (this.prismaService as any).user.create({ data: {
                name,
                telegramId: incomingId,
                telegramUsername: payload.username ?? null,
                telegramPhoto: payload.photo_url ?? null,
                phoneVerified: true,
            } });
        } else {
            // update username/photo if changed
            const newUsername = payload.username ?? null;
            const newPhoto = payload.photo_url ?? null;
            const updateData: any = {};
            if(newUsername && user.telegramUsername !== newUsername) updateData.telegramUsername = newUsername;
            if(newPhoto && user.telegramPhoto !== newPhoto) updateData.telegramPhoto = newPhoto;
            if(Object.keys(updateData).length) {
                await (this.prismaService as any).user.update({ where: { id: user.id }, data: updateData });
            }
        }

        return this.authById(res, user.id);
    }

    private verifyTelegramAuth(payload: Record<string, any>, botToken: string){
        try{
            const data = { ...payload } as Record<string, any>;
            const hash = String(data.hash ?? '');
            delete data.hash;

            // Build data_check_string according to Telegram docs
            const keys = Object.keys(data).sort();
            const dataCheckArr = keys.map(k => `${k}=${data[k]}`);
            const dataCheckString = dataCheckArr.join('\n');

            // secret_key = sha256(bot_token)
            const secretKey = createHash('sha256').update(botToken).digest();
            const hmac = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

            // Optional: check auth_date freshness (1 day)
            const authDate = Number(payload.auth_date || 0);
            const now = Math.floor(Date.now() / 1000);
            if(authDate && Math.abs(now - authDate) > 86400){
                return false;
            }

            return hmac === hash;
        }catch(e){
            this.logger.error('Failed to verify telegram auth', e as any);
            return false;
        }
    }

    private auth(res: Response, id: string){
        const { accessToken, refreshToken } = this.generateTokens(id);

        this.setCookie(
            res,
            refreshToken, 
            new Date(Date.now() + 1000 * 60 * 60 * 24 * 7));

        return { accessToken };
    }

    private generateTokens(id: string){
        const payload: JwtPayload = { id };
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.getOrThrow<string>("JWT_SECRET_KEY"),
            expiresIn: this.JWT_ACCESS_TOKEN_TTL,
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.getOrThrow<string>("JWT_SECRET_KEY"),
            expiresIn: this.JWT_REFRESH_TOKEN_TTL,
        });
        return {
            accessToken,
            refreshToken,
        };
    }

    private setCookie(res: Response, value: string, expires: Date){
        res.cookie('refreshToken', value, {
            httpOnly: true,
            domain: this.COOKIE_DOMAIN,
            expires,
            secure: !isDev(this.configService),
            sameSite: isDev(this.configService) ? 'none' : 'lax',
        });
    }
}

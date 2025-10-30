import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterRequest } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { hash } from 'argon2';
import { JwtService } from '@nestjs/jwt'
import type { JwtPayload } from './interfaces/jwt.interface';
import { LoginRequest } from './dto/login.dto';
import { verify } from 'argon2';
import type { Response } from 'express';
import type { Request} from 'express';
import { isDev } from 'src/utilities/is-dev.util';

@Injectable()
export class AuthService {
    private readonly JWT_SECRET: string;
    private readonly JWT_ACCESS_TOKEN_TTL: string;
    private readonly JWT_REFRESH_TOKEN_TTL: string;

    private readonly COOKIE_DOMAIN: string;

    constructor(private readonly prismaService: PrismaService, 
                private readonly configService: ConfigService,
                private readonly jwtService: JwtService,){
                    this.JWT_SECRET = configService.getOrThrow<string>('JWT_SECRET_KEY');
                    this.JWT_ACCESS_TOKEN_TTL = configService.getOrThrow<string>('JWT_ACCESS_TOKEN_TTL');
                    this.JWT_REFRESH_TOKEN_TTL = configService.getOrThrow<string>('JWT_REFRESH_TOKEN_TTL');
                    this.COOKIE_DOMAIN = configService.getOrThrow<string>('COOKIE_DOMAIN');
                }
    
    async register(res: Response, dto: RegisterRequest){
        const {name, email, password} = dto;
            
        const existUser = await this.prismaService.user.findUnique({
            where: {
                email,
            }
        })
        if(existUser){
            throw new ConflictException('Пользователь с почтой уже существует');
        };

        const user = await this.prismaService.user.create({
            data:{
                name,
                email,
                password: await hash(password),
            },
        });
        return this.auth(res, user.id);
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

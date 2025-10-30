import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import type { JwtPayload } from '../interfaces/jwt.interface';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
        private readonly prismaService: PrismaService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>('JWT_SECRET_KEY'),
            algorithms: ["HS256"],
        });
    }

    async validate(payload: JwtPayload){
        const user = await this.prismaService.user.findUnique({ where: { id: payload.id } });
        
        if (!user) {
            throw new UnauthorizedException();
        }

        return await this.authService.validate(payload.id);
    }
}
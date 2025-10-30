import { ConfigService } from '@nestjs/config';
import type { JwtModuleOptions } from '@nestjs/jwt'
import * as dotenv from "dotenv";

export async function getJwtConfig(configService: ConfigService):Promise<JwtModuleOptions> {

    return {
        secretOrPrivateKey: configService.getOrThrow<string>("JWT_SECRET_KEY"),
        signOptions: {
            algorithm: 'HS256',
        },
        verifyOptions: {
            algorithms: ['HS256'],
            ignoreExpiration: false,
        },
    }
    
}
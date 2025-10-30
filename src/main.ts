import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as passport from 'passport';
import { DocumentBuilder } from '@nestjs/swagger';
import { SwaggerModule } from '@nestjs/swagger/dist';


const PORT  = 3000;
const HOST = "localhost";
require('dotenv').config;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.use(
  //   session({
  //     secret: 'keyword',
  //     resave: false,
  //     saveUninitialized: false,
  //   }),
  // );
  // app.use(passport.initialize());
  // app.use(passport.session());

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe());
  
  const config = new DocumentBuilder()
    .setTitle('backend-black-lion')
    .setDescription('api documentation')
    .setVersion('1.0')
    .addTag('api')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, document);

  await app.listen(PORT);
  console.log(`Server was uploaded on http://${HOST}:${PORT}`)
}
bootstrap();

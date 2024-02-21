import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Get } from '@nestjs/common';
import dir, { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import session from 'express-session';
import firebaseAdmin from "firebase-admin";
import flash from "express-flash";
import { AdminSeederService } from './admin-seeder/admin-seeder.service';
import rawBodyMiddleware from './webhook/rawBody.middleware';

let serviceAccount = require(`${process.cwd()}/src/config/firebase.json`);

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(rawBodyMiddleware());
  const config = new DocumentBuilder()
    .setTitle('I Am Just Fine')
    .setDescription('I am just fine API list')
    .setVersion('1.0')
    .addTag('JustFine')
    .addServer(process.env.nodeSwaggerSiteUrl)
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
    })
    .build();

  //const adminSeeder = app.get(AdminSeederService);
  //await adminSeeder.seed();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, document);
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    }),
  );

  // app.setGlobalPrefix('api');

  app.use(function (req, res, next, err) {
    next();
  });

  module.exports = firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount)
  });

  app.enableCors();
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');
  app.useGlobalPipes(new ValidationPipe());
  app.useStaticAssets(join(__dirname, '..', 'public/'));

  app.use(flash());

  await app.listen(process.env.APP_PORT);
}
bootstrap();

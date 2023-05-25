import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as expressHbs from 'express-handlebars';
import * as hbs from 'hbs';
import { join } from 'path';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as passport from 'passport';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Enable CORS
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  // Sessions
  app.use(
    session({
      secret: 'SUPER_DUPER_SECRET_KEY',
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // Assets
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Views
  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  // Cookie parser middleware
  // To parse cookies from JWT
  app.use(cookieParser());
  app.engine(
    'hbs',
    expressHbs.engine({
      layoutsDir: join(__dirname, '..', 'views/layouts'),
      defaultLayout: 'layout',
      extname: 'hbs',
      helpers: {
        ifSignedIn: function (options) {
          const { isAuthenticated } = options.data.root;
          return isAuthenticated ? options.fn(this) : options.inverse(this);
        },
      },
    }),
  );
  hbs.registerPartials(__dirname + '/views/partials');
  app.setViewEngine('hbs');

  // Swagger
  const docConfig = new DocumentBuilder()
    .setTitle('Nest Blog')
    .setDescription('API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, docConfig);
  SwaggerModule.setup('api', app, document);

  // Port
  await app.listen(3000);
}
bootstrap();

import express from 'express';
import session from 'express-session';
import { ConsumerManager } from './consumers';
import { BookController, GoogleSheetController, UserController } from './controllers';
import { App, RedisStore } from './core';
import { ConfigService, GoogleSheetService, LoggerService, RedisService, RedlockService } from './services';

async function main() {
  const app = new App();

  app.registerProviders([
    {
      provide: LoggerService,
      useValue: new LoggerService(),
    },
    {
      provide: ConfigService,
      useValue: new ConfigService(),
    },
    {
      inject: [ConfigService],
      provide: RedisService,
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('REDIS_URL');
        return new RedisService(url);
      },
    },
    {
      inject: [RedisService],
      provide: RedlockService,
      useFactory: (redis: RedisService) => {
        return new RedlockService({ redis });
      },
    },
    {
      inject: [RedisService],
      provide: ConsumerManager,
      useFactory: (redis: RedisService) => {
        return new ConsumerManager({ redis });
      },
    },
    {
      inject: [ConfigService],
      provide: GoogleSheetService,
      useFactory: (config: ConfigService) => {
        return new GoogleSheetService({
          docID: config.get<string>('SHEET_DOC_ID'),
          credentials: {
            client_email: config.get<string>('SHEET_CLIENT_EMAIL'),
            private_key: config.get<string>('SHEET_PRIVATE_KEY'),
          },
        });
      },
    },
  ]);
  await app.bootstrap();
  const config = app.get(ConfigService) as ConfigService;
  const redis = app.get(RedisService) as RedisService;
  const logger = app.get(LoggerService) as LoggerService;

  const middlewares = [
    session({
      store: new RedisStore({ redis }),
      secret: config.get<string>('SESSION_SECRET'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        httpOnly: true,
        maxAge: +config.get<number>('SESSION_MAX_AGE'),
      },
    }),
    express.json(),
    express.urlencoded({ extended: true }),
  ];
  app.use(...middlewares);

  app.registerControllers([BookController, GoogleSheetController, UserController]);

  const port = +config.get<number>('PORT');
  app.listen(port, () => {
    logger.log(`App is listening on port %d`, port);
  });
}

main();

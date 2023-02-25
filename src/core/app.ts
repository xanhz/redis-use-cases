import express, { Express, Request, Response, Router } from 'express';
import { HttpError } from '../errors';
import * as _ from '../helpers/is';
import { LoggerService } from '../services';
import { HTTP_METHOD_KEY, HTTP_PATH_KEY, HTTP_PATH_PREFIX_KEY } from './decorators';
import { ControllerConstructor, InjectionToken, Provider } from './interfaces';
import { storage } from './storage';
import { isOnApplicationBootstrap, isOnApplicationDestroy, toStringToken } from './utils';

export class App {
  private readonly providers: Map<string, any>;
  private readonly app: Express;
  private readonly logger: LoggerService;

  constructor() {
    this.app = express();
    this.providers = new Map();
    this.logger = new LoggerService();
  }

  public use(...handlers: any[]) {
    this.app.use(...handlers);
  }

  public listen(port: number, callback?: () => void) {
    this.app.listen(port, callback);
  }

  public async bootstrap() {
    for (const provider of this.providers.values()) {
      if (isOnApplicationBootstrap(provider)) {
        await provider.onBootstrap();
      }
    }
  }

  public registerProviders(providers: Provider[]) {
    for (const provider of providers) {
      const { provide, inject = [], useFactory, useValue } = provider;
      const token = toStringToken(provide);

      this.logger.log('Initializing provider %s', token);

      if (!_.isNil(useValue)) {
        this.providers.set(token, useValue);
        continue;
      }

      if (!_.isNil(useFactory)) {
        const args = inject.map(arg => {
          const token = toStringToken(arg);
          const instance = this.providers.get(token);
          if (_.isNil(instance)) {
            throw new Error(`Missing ${token}`);
          }
          return instance;
        });
        const instance = useFactory(...args);
        this.providers.set(token, instance);
        continue;
      }

      throw new Error('Missing provider value of factory');
    }
  }

  public registerControllers(controllers: ControllerConstructor[]) {
    const routers = controllers.map((controller) => this.createRouter(controller));
    this.app.use(...routers);
  }

  private createRouter(Class: ControllerConstructor) {
    const prefix: string = Reflect.getMetadata(HTTP_PATH_PREFIX_KEY, Class);
    const params: any[] = Reflect.getOwnMetadata('design:paramtypes', Class) ?? [];
    const router = Router();

    const args = params.map(param => {
      const arg = this.get(param.name);
      if (_.isNil(arg)) {
        throw new Error(`Missing ${param.name} when create ${Class.name}`);
      }
      return arg;
    });

    const controller = new Class(...args);
    const prototype = Object.getPrototypeOf(controller);
    const props = Object.getOwnPropertyNames(prototype);

    for (const prop of props) {
      const handler: (req: Request, res: Response) => Promise<any> = controller[prop];

      if (!_.isFunction(handler)) {
        continue;
      }

      const method: string = Reflect.getMetadata(HTTP_METHOD_KEY, prototype, prop);
      const path: string = Reflect.getMetadata(HTTP_PATH_KEY, prototype, prop);
      if (_.isNil(method) || _.isNil(path)) {
        continue;
      }

      const route = `/${prefix}/${path}`;
      this.logger.log('Create route %s %s', method, route);
      // @ts-ignore
      router[method](route, async (req: Request, res: Response) => {
        try {
          const context = { app: this, req, res };
          const result = await storage.run(context, () => handler.bind(controller)(req, res));
          res.status(200).send(result);
        } catch (error: any) {
          const httpError = error instanceof HttpError ? error : new HttpError(error.message, 500);
          this.logger.error(`[REQUEST_ERROR]:`, error);
          const { code } = httpError;
          const body = httpError.toJSON();
          return res.status(code).send(body);
        }
      });
    }

    return router;
  }

  public async close() {
    for (const provider of this.providers.values()) {
      if (isOnApplicationDestroy(provider)) {
        await provider.onDestroy();
      }
    }
  }

  public get(token: InjectionToken) {
    const $token = toStringToken(token);
    return this.providers.get($token);
  }
}

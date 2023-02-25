import { AsyncLocalStorage } from 'async_hooks';
import { Request, Response } from 'express';
import { App } from './app';

export interface HandlerContext {
  app: App;
  req: Request;
  res: Response;
}

export const storage = new AsyncLocalStorage<HandlerContext>();

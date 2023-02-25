import { Request, Response } from 'express';
import { HandlerContext, storage } from '../core';
import { TooManyRequest } from '../errors';
import { RedisService } from '../services';

export interface RateLimitOptions {
  max: number;
  duration: number;
  prefix?: string;
  setHeader?: boolean;
  keyGenerator?: (req: Request) => string;
}

export function RateLimit(options: RateLimitOptions) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value as Function;

    descriptor.value = async function (...args: any[]) {
      const req = args[0] as Request;
      const res = args[1] as Response;

      const { app } = storage.getStore() as HandlerContext;
      const redis = app.get(RedisService) as RedisService;

      const {
        duration,
        max,
        keyGenerator = req => req.url.slice(1),
        prefix = 'http-limit',
        setHeader = true,
      } = options;

      const key = `${prefix}:${keyGenerator(req)}`;
      const responses = await redis.multi().incr(key).expire(key, duration, 'NX').get(key).exec();
      const [error, count] = responses ? responses[0] : [null, 0];
      if (setHeader) {
        res.setHeader('x-max-request', max);
        // @ts-ignore
        res.setHeader('x-remain-request', Math.max(0, max - count));
      }
      if (error) {
        throw error;
      }
      // @ts-ignore
      if (count > max) {
        throw new TooManyRequest();
      }
      return originalMethod.apply(this, args);
    };
  };
}

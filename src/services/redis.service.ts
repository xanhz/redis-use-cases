import { Redis, RedisOptions } from 'ioredis';

export interface ConnectionOptions extends Omit<RedisOptions, 'lazyConnect'> {}

export class RedisService extends Redis {
  constructor(url: string, options: ConnectionOptions = {}) {
    super(url, { ...options, lazyConnect: true });
  }
}

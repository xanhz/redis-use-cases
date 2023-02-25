import { Redis, RedisOptions } from 'ioredis';
import Redlock, { Settings } from 'redlock';

export interface RedlockOptions {
  redis: Redis;
  settings?: Partial<Settings>;
}

export class RedlockService extends Redlock {
  constructor(options: RedlockOptions) {
    const { redis, settings } = options;
    super([redis], settings);
  }
}

import { SessionData, Store } from 'express-session';
import { Redis, RedisOptions } from 'ioredis';

export interface ConnectionOptions extends RedisOptions {
  url: string;
}

export interface RedisStoreOptions {
  redis?: ConnectionOptions | Redis;
  prefix?: string;
  ttl?: number;
}

const $fallback = (...args: any[]) => {};

export class RedisStore extends Store {
  private readonly redis: Redis;
  private readonly prefix: string;
  private readonly ttl: number;

  constructor(options: RedisStoreOptions = {}) {
    super({});
    const { redis = {}, prefix = 'session', ttl = 86400 } = options;
    this.ttl = ttl;
    this.prefix = prefix;
    if (redis instanceof Redis) {
      this.redis = redis;
    } else {
      // @ts-ignore
      const { url, ...rest } = redis;
      this.redis = new Redis(url, rest);
    }
  }

  public get(sid: string, cb = $fallback): void {
    let key = this.prefix + sid;

    this.redis.get(key, (err, data) => {
      if (err) return cb(err);
      if (!data) return cb(null);

      let result;
      try {
        result = JSON.parse(data);
      } catch (err) {
        return cb(err);
      }
      return cb(null, result);
    });
  }

  public set(sid: string, session: SessionData, cb = $fallback): void {
    try {
      this.redis.set(`${this.prefix}:${sid}`, JSON.stringify(session), 'EX', this.ttl, cb);
    } catch (e) {
      return cb(e);
    }
  }

  public destroy(sid: string, cb = $fallback): void {
    this.redis.del(`${this.prefix}:${sid}`, cb);
  }
}

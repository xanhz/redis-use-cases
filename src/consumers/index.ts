import Redis from 'ioredis';
import { OnApplicationBootstrap } from '../core';
import { LoggerService } from '../services';

export interface ConsumerManagerOptions {
  redis: Redis;
}

export class ConsumerManager implements OnApplicationBootstrap {
  protected readonly callbacks: Map<string, (payload: any) => void>;
  private readonly logger: LoggerService;
  private readonly redis: Redis;

  constructor(options: ConsumerManagerOptions) {
    const { redis } = options;
    this.redis = redis;
    this.callbacks = new Map();
    this.logger = new LoggerService();
  }

  public subscribe(channel: string, callback: (payload: any) => void) {
    this.callbacks.set(channel, callback);
    return this.redis.subscribe(channel);
  }

  public onBootstrap(): Promise<any> {
    this.redis.on('message', (channel, message) => {
      const payload = JSON.parse(message);
      const callback = this.callbacks.get(channel);
      callback && callback(payload);
    });
    return this.subscribe('pub-sub-redis', (payload: any) => {
      this.logger.log('[SUBSCRIBER] %o', payload);
    });
  }
}

import dotenv, { DotenvConfigOptions } from 'dotenv';

export class ConfigService {
  private store: Record<string, any>;

  constructor(options: DotenvConfigOptions = {}) {
    const { parsed } = dotenv.config(options);
    this.store = Object.assign({}, parsed);
  }
  public get<T = any>(key: string, defaultValue?: T): T {
    return (this.store[key] || defaultValue) as T;
  }
}

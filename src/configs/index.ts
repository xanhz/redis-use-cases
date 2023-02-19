import dotenv from 'dotenv'

export class ConfigModule {
  private static _instance: ConfigModule
  private _store: { [x: string]: any }

  private constructor() {
    const { parsed } = dotenv.config()
    this._store = Object.assign({}, parsed)
  }

  public static getInstance() {
    if (!ConfigModule._instance) {
      ConfigModule._instance = new ConfigModule()
    }
    return ConfigModule._instance
  }

  public get<T = any>(key: string, defaultValue?: T): T {
    return (this._store[key] || defaultValue) as T
  }
}

export interface OnApplicationBootstrap {
  onBootstrap(): Promise<any>;
}

export interface OnApplicationDestroy {
  onDestroy(): Promise<any>;
}

export interface Type<T = any> extends Function {
  new (...args: any[]): T;
}
export interface Abstract<T> extends Function {
  prototype: T;
}

export type InjectionToken<T = any> = string | Type<T> | Abstract<T> | Function;

export interface Provider<T = any> {
  provide: InjectionToken;
  inject?: InjectionToken[];
  useFactory?: (...args: any[]) => T;
  useValue?: T;
}

export interface ControllerConstructor<T = any> {
  new (...args: any[]): T;
}

export interface AppConfig {
  providers?: Provider[];
  controllers?: ControllerConstructor[];
}

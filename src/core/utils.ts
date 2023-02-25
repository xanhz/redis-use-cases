import { isFunction } from '../helpers/is';
import { InjectionToken, OnApplicationBootstrap, OnApplicationDestroy } from './interfaces';

export function isOnApplicationBootstrap(obj: any): obj is OnApplicationBootstrap {
  return 'onBootstrap' in obj && typeof obj.onBootstrap === 'function';
}

export function isOnApplicationDestroy(obj: any): obj is OnApplicationDestroy {
  return 'onDestroy' in obj && typeof obj.onDestroy === 'function';
}

export function toStringToken(token: InjectionToken) {
  return isFunction(token) ? token.name : token;
}

import 'reflect-metadata';

export const HTTP_METHOD_KEY = 'HTTP_METHOD';
export const HTTP_PATH_KEY = 'HTTP_PATH';
export const HTTP_PATH_PREFIX_KEY = 'HTTP_PATH_PREFIX';

export const HttpRequest = (method: string, path: string = '') => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(HTTP_METHOD_KEY, method.toLowerCase(), target, propertyKey);
    Reflect.defineMetadata(HTTP_PATH_KEY, path, target, propertyKey);
  };
};

export const Get = (path: string = '') => HttpRequest('GET', path);

export const Post = (path: string = '') => HttpRequest('POST', path);

export const Delete = (path: string = '') => HttpRequest('DELETE', path);

export const Controller = (prefix: string = '') => {
  return (target: any) => Reflect.defineMetadata(HTTP_PATH_PREFIX_KEY, prefix, target);
};

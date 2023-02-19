export function HttpCode(code: number) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Object.defineProperty(descriptor.value, 'statusCode', { value: code })
  }
}

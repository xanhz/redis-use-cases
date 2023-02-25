export function isFunction(fn: any): fn is Function {
  return typeof fn === 'function';
}

export function isString(s: any): s is string {
  return typeof s === 'string';
}

export function isSymbol(sym: any): sym is symbol {
  return typeof sym === 'symbol';
}

export function isNil(val: any): val is null | undefined {
  return val == null;
}

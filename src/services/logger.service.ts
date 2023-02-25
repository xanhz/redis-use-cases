export class LoggerService {
  constructor() {}

  private now() {
    const time = new Date();
    const yyyy = time.getFullYear().toString().padStart(4, '0');
    const MM = (time.getMonth() + 1).toString().padStart(2, '0');
    const dd = time.getDate().toString().padStart(2, '0');
    const hh = time.getHours().toString().padStart(2, '0');
    const mm = time.getMinutes().toString().padStart(2, '0');
    const ss = time.getSeconds().toString().padStart(2, '0');
    const ms = time.getMilliseconds().toString().padStart(3, '0');

    return `${yyyy}/${MM}/${dd} ${hh}:${mm}:${ss}.${ms}`;
  }

  public log(message: string, ...meta: any[]) {
    console.log(`[${this.now()}]: ${message}`, ...meta);
  }

  public error(message: string, ...meta: any[]) {
    console.error(`[${this.now()}]: ${message}`, ...meta);
  }
}

export class HttpError extends Error {
  public readonly code: number;
  protected error: any;

  constructor(error: any, code?: number) {
    super();
    this.error = error;
    this.code = code || 500;
  }

  toJSON() {
    return {
      code: this.code,
      error_detail: this.error,
    };
  }
}

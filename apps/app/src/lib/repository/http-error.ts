export type HttpErrorOptions = {
  cause?: unknown;
  headers?: Headers;
  url?: string;
};

export class HttpError extends Error {
  readonly status: number;
  readonly data?: unknown;
  readonly cause?: unknown;
  readonly headers?: Headers;
  readonly url?: string;

  constructor(
    status: number,
    message: string,
    data?: unknown,
    options: HttpErrorOptions = {},
  ) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.data = data;
    this.cause = options.cause;
    this.headers = options.headers;
    this.url = options.url;
  }
}

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}

import { HttpError } from '@/lib/repository/http-error';
import { InterceptorManager } from '@/lib/repository/interceptor';

export type HttpResponse<T> = {
  data: T;
  headers: Headers;
  status: number;
};

export type QueryPrimitive = boolean | number | string;
export type QueryValue =
  QueryPrimitive | readonly QueryPrimitive[] | null | undefined;
export type QueryParams = Readonly<Record<string, QueryValue>>;

export type AccessTokenProvider = () =>
  Promise<string | null | undefined> | string | null | undefined;

export type HttpRequestInit = RequestInit & {
  auth?: boolean;
};

export type HttpRequestOptions = Omit<HttpRequestInit, 'body' | 'method'>;

export type HttpClientOptions = {
  baseUrl: string;
  defaultHeaders?: RequestInit['headers'];
  fetchImpl?: typeof fetch;
  getAccessToken?: AccessTokenProvider;
};

type MutationMethod = 'PATCH' | 'POST' | 'PUT';

export class HttpClient {
  readonly baseUrl: string;
  readonly interceptors = {
    request: new InterceptorManager<RequestInit>(),
    response: new InterceptorManager<HttpResponse<unknown>>(),
  };

  private readonly defaultHeaders?: RequestInit['headers'];
  private readonly fetcher: typeof fetch;
  private readonly getAccessToken?: AccessTokenProvider;

  constructor({
    baseUrl,
    defaultHeaders,
    fetchImpl = fetch,
    getAccessToken,
  }: HttpClientOptions) {
    this.baseUrl = normalizeBaseUrl(baseUrl);
    this.defaultHeaders = defaultHeaders;
    this.fetcher = fetchImpl;
    this.getAccessToken = getAccessToken;
  }

  get<T = unknown>(
    endpoint: string,
    params: QueryParams = {},
    options: HttpRequestOptions = {},
  ) {
    return this.request<T>(appendQuery(endpoint, params), {
      ...options,
      method: 'GET',
    });
  }

  post<T = unknown, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options: HttpRequestOptions = {},
  ) {
    return this.mutate<T, TBody>('POST', endpoint, body, options);
  }

  put<T = unknown, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options: HttpRequestOptions = {},
  ) {
    return this.mutate<T, TBody>('PUT', endpoint, body, options);
  }

  patch<T = unknown, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options: HttpRequestOptions = {},
  ) {
    return this.mutate<T, TBody>('PATCH', endpoint, body, options);
  }

  delete<T = unknown>(endpoint: string, options: HttpRequestOptions = {}) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async request<T = unknown>(endpoint: string, init: HttpRequestInit = {}) {
    const url = this.resolveEndpoint(endpoint);
    let requestInit: RequestInit;

    try {
      requestInit = await this.prepareRequest(init);
    } catch (error) {
      await this.interceptors.request.runRejected(error);
      throw error;
    }

    try {
      const response = await this.fetcher(url, requestInit);
      const data = await parseResponseBody(response);

      if (!response.ok) {
        throw new HttpError(
          response.status,
          getErrorMessage(response, data),
          data,
          { headers: response.headers, url },
        );
      }

      const interceptedResponse = await this.interceptors.response.runFulfilled(
        {
          data,
          headers: response.headers,
          status: response.status,
        },
      );

      return interceptedResponse.data as T;
    } catch (error) {
      if (isAbortError(error)) {
        throw error;
      }

      const httpError =
        error instanceof HttpError
          ? error
          : new HttpError(0, getNetworkErrorMessage(error), undefined, {
              cause: error,
              url,
            });

      await this.interceptors.response.runRejected(httpError);
      throw httpError;
    }
  }

  private mutate<T, TBody>(
    method: MutationMethod,
    endpoint: string,
    body: TBody | undefined,
    options: HttpRequestOptions,
  ) {
    const formData = isFormData(body);
    const headers = new Headers(options.headers);

    if (body !== undefined && !formData && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    return this.request<T>(endpoint, {
      ...options,
      body:
        body === undefined ? undefined : formData ? body : JSON.stringify(body),
      headers,
      method,
    });
  }

  private async prepareRequest(init: HttpRequestInit) {
    const { auth = true, ...requestInit } = init;
    const headers = mergeHeaders(this.defaultHeaders, requestInit.headers);
    if (isFormData(requestInit.body)) {
      headers.delete('Content-Type');
    }
    const token =
      auth && !headers.has('Authorization')
        ? await this.getAccessToken?.()
        : undefined;

    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return this.interceptors.request.runFulfilled({
      credentials: 'include',
      ...requestInit,
      headers,
    });
  }

  private resolveEndpoint(endpoint: string) {
    const trimmedEndpoint = endpoint.trim();
    if (!trimmedEndpoint) {
      throw new TypeError('Endpoint must not be empty');
    }
    if (/^[a-z][a-z\d+.-]*:\/\//i.test(trimmedEndpoint)) {
      throw new TypeError(
        'Endpoint must be relative to the configured base URL',
      );
    }
    if (trimmedEndpoint.includes('#')) {
      throw new TypeError('Endpoint must not contain a URL fragment');
    }

    return `${this.baseUrl}/${trimmedEndpoint.replace(/^\/+/, '')}`;
  }
}

function normalizeBaseUrl(baseUrl: string) {
  const normalized = baseUrl.trim().replace(/\/+$/, '');
  if (!normalized) {
    throw new TypeError('Base URL must not be empty');
  }

  if (
    !/^https?:\/\/[^/?#\s]+(?:\/[^?#\s]*)?$/i.test(normalized) ||
    normalized.includes('?') ||
    normalized.includes('#')
  ) {
    throw new TypeError('Base URL must be a valid absolute URL');
  }

  return normalized;
}

function appendQuery(endpoint: string, params: QueryParams) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue;
    }
    query.append(
      key,
      Array.isArray(value) ? JSON.stringify(value) : String(value),
    );
  }

  const queryString = query.toString();
  if (!queryString) {
    return endpoint;
  }

  const separator = endpoint.includes('?')
    ? endpoint.endsWith('?') || endpoint.endsWith('&')
      ? ''
      : '&'
    : '?';

  return `${endpoint}${separator}${queryString}`;
}

function mergeHeaders(...sources: Array<RequestInit['headers'] | undefined>) {
  const headers = new Headers();

  for (const source of sources) {
    if (!source) {
      continue;
    }
    new Headers(source).forEach((value, key) => headers.set(key, value));
  }

  return headers;
}

async function parseResponseBody(response: Response) {
  if (response.status === 204 || response.status === 205) {
    return undefined;
  }

  const text = await response.text();
  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function getErrorMessage(response: Response, data: unknown) {
  if (
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    typeof data.message === 'string' &&
    data.message
  ) {
    return data.message;
  }
  if (typeof data === 'string' && data) {
    return data;
  }
  if (response.statusText) {
    return response.statusText;
  }
  return `Request failed with status ${response.status}`;
}

function getNetworkErrorMessage(error: unknown) {
  return error instanceof Error && error.message
    ? error.message
    : 'Network request failed';
}

function isAbortError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'AbortError'
  );
}

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}

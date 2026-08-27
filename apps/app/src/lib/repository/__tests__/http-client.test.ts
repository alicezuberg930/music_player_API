import {
  HttpClient,
  HttpError,
  InterceptorManager,
  type HttpClientOptions,
  type HttpResponse,
} from '@/lib/repository';

type ResponseFixture = {
  body?: string;
  headers?: Record<string, string>;
  status?: number;
  statusText?: string;
};

function createResponse({
  body = '',
  headers = {},
  status = 200,
  statusText = '',
}: ResponseFixture = {}) {
  return {
    headers: new Headers(headers),
    ok: status >= 200 && status < 300,
    status,
    statusText,
    text: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe('HttpError', () => {
  test('preserves HTTP failure details', () => {
    const cause = new Error('socket closed');
    const headers = new Headers({ 'x-request-id': 'request-1' });
    const error = new HttpError(
      503,
      'Unavailable',
      { retry: true },
      {
        cause,
        headers,
        url: 'https://api.example.com/v1/songs',
      },
    );

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({
      cause,
      data: { retry: true },
      message: 'Unavailable',
      name: 'HttpError',
      status: 503,
      url: 'https://api.example.com/v1/songs',
    });
    expect(error.headers).toBe(headers);
  });
});

describe('InterceptorManager', () => {
  test('runs active handlers in registration order', async () => {
    const manager = new InterceptorManager<number>();
    const firstId = manager.use(value => value + 1);
    manager.use(async value => value * 2);

    expect(firstId).toBe(0);
    expect(manager.getHandlers()).toHaveLength(2);
    await expect(manager.runFulfilled(3)).resolves.toBe(8);

    manager.eject(firstId);
    await expect(manager.runFulfilled(3)).resolves.toBe(6);

    manager.clear();
    expect(manager.getHandlers()).toHaveLength(0);
  });

  test('awaits rejection handlers', async () => {
    const manager = new InterceptorManager<number>();
    const calls: string[] = [];
    manager.use(undefined, async () => {
      await Promise.resolve();
      calls.push('first');
    });
    manager.use(undefined, () => {
      calls.push('second');
    });

    await manager.runRejected(new Error('failed'));

    expect(calls).toEqual(['first', 'second']);
  });
});

describe('HttpClient', () => {
  let fetchMock: jest.Mock;

  function createClient(
    options: Partial<Omit<HttpClientOptions, 'baseUrl' | 'fetchImpl'>> = {},
  ) {
    return new HttpClient({
      baseUrl: 'https://api.example.com/v1/',
      fetchImpl: fetchMock as unknown as typeof fetch,
      ...options,
    });
  }

  beforeEach(() => {
    fetchMock = jest.fn();
  });

  test('builds encoded GET queries without empty delimiters', async () => {
    fetchMock.mockResolvedValue(createResponse({ body: '{"data":[]}' }));
    const client = createClient();

    await client.get('/songs', {
      available: false,
      empty: null,
      page: 0,
      search: 'night drive',
      tags: ['ambient', 'focus'],
      unset: undefined,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://api.example.com/v1/songs?available=false&page=0&search=night+drive&tags=%5B%22ambient%22%2C%22focus%22%5D',
    );

    fetchMock.mockResolvedValueOnce(createResponse());
    await client.get('health');
    expect(fetchMock.mock.calls[1][0]).toBe(
      'https://api.example.com/v1/health',
    );
  });

  test('merges JSON, authentication, caller, and interceptor headers', async () => {
    fetchMock.mockResolvedValue(createResponse({ body: '{"ok":true}' }));
    const client = createClient({
      defaultHeaders: { 'X-Client': 'app' },
      getAccessToken: async () => 'access-token',
    });
    client.interceptors.request.use(config => {
      const headers = new Headers(config.headers);
      headers.set('X-Interceptor', 'active');
      return { ...config, headers };
    });

    await client.post('/songs', false, {
      headers: { 'X-Request-Id': 'request-1' },
    });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Headers;
    expect(init).toMatchObject({
      body: 'false',
      credentials: 'include',
      method: 'POST',
    });
    expect(headers.get('Authorization')).toBe('Bearer access-token');
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(headers.get('X-Client')).toBe('app');
    expect(headers.get('X-Interceptor')).toBe('active');
    expect(headers.get('X-Request-Id')).toBe('request-1');
  });

  test('supports unauthenticated requests and explicit authorization', async () => {
    fetchMock.mockResolvedValue(createResponse());
    const getAccessToken = jest.fn().mockResolvedValue('stored-token');
    const client = createClient({ getAccessToken });

    await client.post('/auth/sign-in', {}, { auth: false });
    expect(getAccessToken).not.toHaveBeenCalled();

    await client.get(
      '/users/me',
      {},
      {
        headers: { Authorization: 'Bearer explicit-token' },
      },
    );
    expect(getAccessToken).not.toHaveBeenCalled();
    const headers = (fetchMock.mock.calls[1][1] as RequestInit)
      .headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer explicit-token');
  });

  test('passes FormData through without setting a multipart content type', async () => {
    fetchMock.mockResolvedValue(createResponse());
    const client = createClient({
      defaultHeaders: {
        'Content-Type': 'application/json',
        'X-Client': 'app',
      },
    });
    const formData = new FormData();
    formData.append('name', 'artwork');

    await client.post('/upload', formData, {
      headers: { 'X-Upload': 'cover' },
    });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Headers;
    expect(init.body).toBe(formData);
    expect(headers.has('Content-Type')).toBe(false);
    expect(headers.get('X-Client')).toBe('app');
    expect(headers.get('X-Upload')).toBe('cover');
  });

  test.each([
    ['PUT', 'put'],
    ['PATCH', 'patch'],
  ] as const)('sends %s mutations', async (method, clientMethod) => {
    fetchMock.mockResolvedValue(createResponse());
    const client = createClient();

    await client[clientMethod]('/songs/1', { title: 'Signals' });

    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      body: '{"title":"Signals"}',
      method,
    });
  });

  test('sends DELETE requests without an implicit body', async () => {
    fetchMock.mockResolvedValue(createResponse());
    const client = createClient();

    await client.delete('/songs/1', { headers: { 'X-Reason': 'duplicate' } });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe('DELETE');
    expect(init.body).toBeUndefined();
    expect((init.headers as Headers).get('X-Reason')).toBe('duplicate');
  });

  test('returns JSON and awaits response transformations', async () => {
    fetchMock.mockResolvedValue(
      createResponse({
        body: '{"value":1}',
        headers: { 'x-request-id': 'request-1' },
      }),
    );
    const client = createClient();
    const responses: HttpResponse<unknown>[] = [];
    client.interceptors.response.use(async response => {
      await Promise.resolve();
      responses.push(response);
      return { ...response, data: { value: 2 } };
    });

    await expect(client.get<{ value: number }>('/value')).resolves.toEqual({
      value: 2,
    });
    expect(responses[0].status).toBe(200);
    expect(responses[0].headers.get('x-request-id')).toBe('request-1');
  });

  test('supports empty and plain-text success responses', async () => {
    fetchMock
      .mockResolvedValueOnce(createResponse({ status: 204 }))
      .mockResolvedValueOnce(
        createResponse({
          body: 'ready',
          headers: { 'content-type': 'text/plain' },
        }),
      );
    const client = createClient();

    await expect(client.delete('/cache')).resolves.toBeUndefined();
    await expect(client.get<string>('/health')).resolves.toBe('ready');
  });

  test('throws parsed HTTP errors and rejects interceptors once', async () => {
    const headers = { 'x-request-id': 'request-1' };
    fetchMock.mockResolvedValue(
      createResponse({
        body: '{"message":"Invalid input","fields":{"title":"required"}}',
        headers,
        status: 422,
        statusText: 'Unprocessable Entity',
      }),
    );
    const client = createClient();
    const onRejected = jest.fn();
    client.interceptors.response.use(undefined, onRejected);

    const error = await client.post('/songs', {}).catch(value => value);

    expect(error).toBeInstanceOf(HttpError);
    if (!(error instanceof HttpError)) {
      throw error;
    }
    expect(error).toMatchObject({
      data: {
        fields: { title: 'required' },
        message: 'Invalid input',
      },
      message: 'Invalid input',
      status: 422,
      url: 'https://api.example.com/v1/songs',
    });
    expect(error.headers?.get('x-request-id')).toBe('request-1');
    expect(onRejected).toHaveBeenCalledTimes(1);
    expect(onRejected).toHaveBeenCalledWith(error);
  });

  test('preserves text HTTP errors and deterministic empty error messages', async () => {
    fetchMock
      .mockResolvedValueOnce(
        createResponse({ body: 'bad gateway', status: 502 }),
      )
      .mockResolvedValueOnce(createResponse({ status: 500 }));
    const client = createClient();

    await expect(client.get('/text-error')).rejects.toMatchObject({
      data: 'bad gateway',
      message: 'bad gateway',
      status: 502,
    });
    await expect(client.get('/empty-error')).rejects.toMatchObject({
      message: 'Request failed with status 500',
      status: 500,
    });
  });

  test('normalizes transport failures with their original cause', async () => {
    const cause = new TypeError('Network request failed');
    fetchMock.mockRejectedValue(cause);
    const client = createClient();
    const onRejected = jest.fn();
    client.interceptors.response.use(undefined, onRejected);

    const error = await client.get('/songs').catch(value => value);

    expect(error).toMatchObject({
      cause,
      message: 'Network request failed',
      status: 0,
      url: 'https://api.example.com/v1/songs',
    });
    expect(onRejected).toHaveBeenCalledTimes(1);
    expect(onRejected).toHaveBeenCalledWith(error);
  });

  test('preserves aborted requests as cancellations', async () => {
    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';
    fetchMock.mockRejectedValue(abortError);
    const client = createClient();
    const onRejected = jest.fn();
    client.interceptors.response.use(undefined, onRejected);

    await expect(client.get('/songs')).rejects.toBe(abortError);
    expect(onRejected).not.toHaveBeenCalled();
  });

  test('runs request rejection handlers without calling fetch', async () => {
    const failure = new Error('Token storage unavailable');
    const client = createClient({
      getAccessToken: async () => {
        throw failure;
      },
    });
    const onRejected = jest.fn();
    client.interceptors.request.use(undefined, onRejected);

    await expect(client.get('/songs')).rejects.toBe(failure);
    expect(onRejected).toHaveBeenCalledTimes(1);
    expect(onRejected).toHaveBeenCalledWith(failure);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('rejects invalid base URLs and absolute endpoints', async () => {
    expect(
      () =>
        new HttpClient({
          baseUrl: 'api.example.com',
          fetchImpl: fetchMock as unknown as typeof fetch,
        }),
    ).toThrow('Base URL must be a valid absolute URL');

    const client = createClient();
    await expect(client.get('https://other.example.com/songs')).rejects.toThrow(
      'Endpoint must be relative to the configured base URL',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

import { API_BASE_URL } from '@/lib/repository/api-config';
import {
  HttpClient,
  type HttpClientOptions,
} from '@/lib/repository/http-client';

export * from '@/lib/repository/api-config';
export * from '@/lib/repository/api-response';
export * from '@/lib/repository/http-client';
export * from '@/lib/repository/http-error';
export * from '@/lib/repository/interceptor';

export type ApiClientOptions = Omit<HttpClientOptions, 'baseUrl'> & {
  baseUrl?: string;
};

function createApiClient(options: ApiClientOptions = {}) {
  return new HttpClient({
    ...options,
    baseUrl: options.baseUrl ?? API_BASE_URL,
  });
}

const httpClient = createApiClient();

export { createApiClient, httpClient };

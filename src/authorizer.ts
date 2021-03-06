import { AxiosRequestConfig } from 'axios';
import { Cache } from 'cache-manager';
import { IAuthorizerStrategy } from './strategy';

export interface IAuthorizerConfig {
  cache: Cache;
  strategy: IAuthorizerStrategy;
  ttlBuffer: number;
  cacheKeyBuilder?: (requestConfig: AxiosRequestConfig) => string;
}

export class Authorizer {
  private readonly config: IAuthorizerConfig;

  constructor(config: IAuthorizerConfig) {
    this.config = config;
    this.getToken = this.getToken.bind(this);
    this.authTtl = this.authTtl.bind(this);
    this.getCacheKey = this.getCacheKey.bind(this);
    this.interceptor = this.interceptor.bind(this);
  }

  getCacheKey(inputRequestConfig: AxiosRequestConfig) {
    if (this.config.cacheKeyBuilder) {
      return this.config.cacheKeyBuilder(inputRequestConfig);
    }

    return 'const';
  }

  getToken(inputRequestConfig: AxiosRequestConfig) {
    return this.config.cache.wrap(
      this.getCacheKey(inputRequestConfig),
      this.config.strategy.getToken,
      {
        ttl: this.authTtl,
      },
    );
  }

  authTtl(cacheableResponse: any) {
    const data = Array.isArray(cacheableResponse) ? cacheableResponse[1] : cacheableResponse;
    return data.expires_in - this.config.ttlBuffer;
  }

  async interceptor(inputRequestConfig: AxiosRequestConfig) {
    const outputRequestConfig = inputRequestConfig;
    const token = await this.getToken(inputRequestConfig);
    outputRequestConfig.headers.Authorization = `Bearer ${token.access_token}`;

    return outputRequestConfig;
  }
}

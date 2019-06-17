export class Authorizer {
  private readonly config: any;
  constructor(config: any) {
    this.config = config;
    this.getToken = this.getToken.bind(this);
    this.authTtl = this.authTtl.bind(this);
    this.interceptor = this.interceptor.bind(this);
  }

  static getCacheKey(inputRequestConfig: any) {
    return inputRequestConfig.cacheKey || 'const';
  }

  getToken(inputRequestConfig: any) {
    return this.config.cache.wrap(
      Authorizer.getCacheKey(inputRequestConfig),
      this.config.strategy.getToken,
      {
        ttl: this.authTtl,
      },
    );
  }

  authTtl(authResponse: any) {
    return authResponse.data.expires_in - this.config.ttlBuffer;
  }

  async interceptor(inputRequestConfig: any) {
    const outputRequestConfig = inputRequestConfig;
    const token = await this.getToken(inputRequestConfig);
    outputRequestConfig.headers.Authorization = `Bearer ${token.data.access_token}`;

    return outputRequestConfig;
  }
}

class Authorizer {
  constructor(config) {
    this.config = config;
    this.getToken = this.getToken.bind(this);
    this.authTtl = this.authTtl.bind(this);
    this.interceptor = this.interceptor.bind(this);
  }

  static getCacheKey(inputRequestConfig) {
    return inputRequestConfig.cacheKey || 'const';
  }

  getToken(inputRequestConfig) {
    return this.config.cache.wrap(
      Authorizer.getCacheKey(inputRequestConfig),
      this.config.strategy.getToken,
      {
        ttl: this.authTtl,
      },
    );
  }

  authTtl(authResponse) {
    return authResponse.data.expires_in - this.config.ttlBuffer;
  }

  async interceptor(inputRequestConfig) {
    const outputRequestConfig = inputRequestConfig;
    const token = await this.getToken(inputRequestConfig);
    outputRequestConfig.headers.Authorization = `Bearer ${token.data.access_token}`;

    return outputRequestConfig;
  }
}

module.exports = Authorizer;

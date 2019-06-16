const qs = require('qs');

class RefreshTokenStrategy {
  constructor(config) {
    this.config = config;
    this.getToken = this.getToken.bind(this);
  }

  async getToken() {
    if (!this.config.refreshToken) {
      this.config.refreshToken = await this.config.readRefreshToken();
    }

    const data = qs.stringify({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      redirect_uri: this.config.redirectUri,
      refresh_token: this.config.refreshToken,
      grant_type: 'refresh_token',
    });

    return this.config.axios({
      url: this.config.url,
      method: 'post',
      data,
    });
  }
}

module.exports = RefreshTokenStrategy;

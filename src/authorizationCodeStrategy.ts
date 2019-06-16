import qs from 'qs';
import { RefreshTokenStrategy } from './refreshTokenStrategy';

export class AuthorizationCodeStrategy {
  private readonly config: any;
  private readonly refreshTokenStrategy: RefreshTokenStrategy;

  constructor(config: any) {
    this.config = config;
    this.refreshTokenStrategy = new RefreshTokenStrategy({
      axios: config.axios,
      url: config.url,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      refreshToken: config.refreshToken,
      redirectUri: config.redirectUri,
      readRefreshToken: config.readRefreshToken,
    });
    this.getToken = this.getToken.bind(this);
  }

  async getToken() {
    if (!this.refreshTokenStrategy.config.refreshToken) {
      this.refreshTokenStrategy.config.refreshToken = await this.config.readRefreshToken();

      if (!this.refreshTokenStrategy.config.refreshToken) {
        const code = await this.config.readAuthCode();
        const data = qs.stringify({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          redirect_uri: this.config.redirectUri,
          code,
          grant_type: 'authorization_code',
        });

        const authCodeResponse = await this.config.axios({
          url: this.config.url,
          method: 'post',
          data,
        });

        this.refreshTokenStrategy.config.refreshToken = authCodeResponse.data.refresh_token;
        await this.config.writeRefreshToken(authCodeResponse.data.refresh_token);

        delete authCodeResponse.data.refresh_token;

        return authCodeResponse;
      }
    }

    return this.refreshTokenStrategy.getToken();
  }

  async getRefreshToken() {
    return this.refreshTokenStrategy.getToken();
  }
}
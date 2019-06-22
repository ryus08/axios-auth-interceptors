import qs from 'qs';
import { AxiosAdapter } from 'axios';

export interface IRefreshTokenStrategyConfig {
  axios: AxiosAdapter;
  url: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  redirectUri: string;
  readRefreshToken: () => string;
}

export class RefreshTokenStrategy {
  public readonly config: IRefreshTokenStrategyConfig;

  constructor(config: IRefreshTokenStrategyConfig) {
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

    const refreshTokenResponse = await this.config.axios({
      url: this.config.url,
      method: 'post',
      data,
    });

    delete refreshTokenResponse.data.refresh_token;

    return refreshTokenResponse.data;
  }
}

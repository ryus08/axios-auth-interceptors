import qs from 'qs';
import { AxiosAdapter } from 'axios';

export interface IClientCredentialsStrategyConfig {
  axios: AxiosAdapter;
  url: string;
  clientId: string;
  clientSecret: string;
  audience?: string;
}

export class ClientCredentialsStrategy {
  public readonly config: IClientCredentialsStrategyConfig;

  constructor(config: IClientCredentialsStrategyConfig) {
    this.config = config;
    this.getToken = this.getToken.bind(this);
  }

  async getToken() {
    const data = qs.stringify({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      audience: this.config.audience,
      grant_type: 'client_credentials',
    });

    const clientCredentialsResponse = await this.config.axios({
      url: this.config.url,
      method: 'post',
      data,
    });

    return clientCredentialsResponse.data;
  }
}

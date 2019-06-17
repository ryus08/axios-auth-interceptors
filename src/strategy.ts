
export interface IAuthorizerStrategy {
  getToken: () => Promise<any>;
}

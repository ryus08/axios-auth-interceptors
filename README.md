# axios-auth-interceptors [![Build Status](https://travis-ci.com/ryus08/axios-auth-interceptors.svg?branch=master)](https://travis-ci.com/ryus08/axios-auth-interceptors)
Auth interceptors for Axios client. Integrates with [node-cache-manager](https://github.com/BryanDonovan/node-cache-manager), (or any implmenting interface of node-cache-manager) for caching auth tokens based on the ttl specified in the grant response.

## Install

Using npm

```sh
npm install --save axios-auth-interceptors
```

## Usage

```javascript
import { caching } from 'cache-manager';
import axios from 'axios';
import { Authorizer, ClientCredentialsStrategy } from 'axios-auth-interceptors';

const main = async () => {
  // Define your auth strategy.
  // For this example, the ClientCredentialsStrategy needs its own axios instance
  // to get a token with
  const authClient = axios.create();
  const strategy = new ClientCredentialsStrategy({
    axios: authClient,  
    url: 'https://myAuthServerUrl.com',
    clientId: 'myClientId',
    clientSecret: 'myClientSecret',
    audience: 'myaudience'
  });

  // Define your cache, can be any object which implements the node-cache-manager API
  const cache = caching({ store: 'memory', max: 100, ttl: 1 });

  // Build your authorizer
  const authorizer = new Authorizer({
    cache,
    strategy,
    ttlBuffer: 10,
  });

  const mainClient = axios.create();

  // Register your authorizer with your main client
  mainClient.interceptors.request.use(authorizer.interceptor);

  // Call the server which requires authorization
  const response = await mainClient.get("https://myAuthorizedServer.com");
  console.log(response.data);
};

main();
```

## Missing features

* 401 challenge response
* Something to test that cache-manager restricts parellel auth calls ([this issue](https://github.com/BryanDonovan/node-cache-manager/issues/8) suggests it is a feature)
* More thought into the cache keys
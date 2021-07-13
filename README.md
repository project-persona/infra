# @persona/infra

a collection of in-house infrastructure and tooling for the Persona project

## Installation

Install with NPM via Git:

```
$ npm install -S https://github.com/project-persona/infra.git
```

Remember to update the package when new version rolls out:

```
$ npm update @persona/infra
```

## [Service Broker](service-broker)

a Zero-MQ powered service-oriented message queue in many-to-many request/reply pattern, based on
[Majordomo Protocol](https://rfc.zeromq.org/spec/7/) (7/MDP).

![Architecture Diagram](https://rfc.zeromq.org/rfcs/7/1.png)

Basically JSON-RPC 2.0 (with tweaks) over 7/MDP. For more information, see [documentation](service-broker). Note: 
heartbeat and down detection currently not implemented due to time constraints.

### Configurations

Optional environment variables:

| Key           | Type    | Description                                                            | Default              |
|---------------|---------|------------------------------------------------------------------------|----------------------|
| `BROKER_ADDR` | string | the ZMQ address for broker to listen and for clients/workers to connect | `tcp://0.0.0.0:5555` |

### Examples

#### Starting the Broker

The broker is designed to run standalone in a separate process. Workers can join or leave a service set at any moment.

It is recommended to start the bus itself before any worker/client.

To start a bus process:

```
$ npm run service-broker
```

#### Worker Process

```js
const { RpcWorker, RpcProvider } = require('@persona/infra/service-broker')
new RpcWorker('serviceName', class extends RpcProvider {
  // a service-wide initializer: this hook will only run once for a service
  async [RpcProvider.init] () {
    // TODO: your code here...
  }

  // a request-scoped before hook: this hook runs for every request before your actually method
  async [RpcProvider.before] () {
    // TODO: your code here...
  }

  // your actual method: name this function whatever your like as long as it's human readable
  async methodName (a, b) {
    // TODO: your code here...
  }

  // a request-scoped after hook: this hook runs for every request after your actually method
  async [RpcProvider.after] () {
    // TODO: your code here...
  }
}, 'tcp://0.0.0.0:5555').start()
```

#### Client Process

```js
const client = RpcClient.create(address, optionalContext)
await client.serviceName.methodName(a, b)
```

You normally don't create client instances from scratch. When implementing a microservice, use the 
`RpcProvider#services` and `RpcProvider#systemServices` injections:

```js
new RpcWorker('serviceName', class extends RpcProvider {
  async methodName (a, b) {
    return this.services.anotherServiceName.anotherMethodName(a, b)
    // or, use systemServices to call from a system context:
    // return this.systemServices.anotherServiceName.anotherMethodName(a, b)
  }
}, 'tcp://0.0.0.0:5555').start()
```

## [Gateway](api-gateway)

a JSON-RPC 2.0 over HTTP gateway exposing microservices connected to the service bus

### Examples

#### Starting the Gateway

The bus is designed to run standalone in a separate process.

It is recommended to start the gateway after the bus has started.

To start a bus process:

```
$ npm run gateway
```

Optional environment variables:

| Key           | Type    | Description                                                             | Default              |
|---------------|---------|-------------------------------------------------------------------------|----------------------|
| `PORT`        | integer | the port number of the http server                                      | `8080`               |
| `HOST`        | string  | the host of the http server                                             | `0.0.0.0`            |
| `BROKER_ADDR` | string  | the ZMQ address for broker to listen and for clients/workers to connect | `tcp://0.0.0.0:5555` |

## Client

A JavaScript web SDK to access microservices connected to the service bus via JSON-RPC HTTP gateway.

### Examples

```js
import firebase from 'firebase'
import { Client } from '@persona/infra/web-sdk'

const app = firebase.initializeApp({ ... })
const client = Client.create(app, optionalGatewayUrl)
await client.yourService.yourMethod(a, b)
```

#### Creating a Client Instance

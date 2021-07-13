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

#### Client Process

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

| Key    | Type    | Description                          | Default   |
|--------|---------|--------------------------------------|-----------|
| `PORT` | integer | the port number of the http server   | `8080`    |
| `HOST` | string  | the host of the http server          | `0.0.0.0` |

## Client

A JavaScript web SDK to access microservices connected to the service bus via JSON-RPC HTTP gateway.

### Examples

#### Creating a Client Instance

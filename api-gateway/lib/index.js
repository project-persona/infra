const http = require('http')

const App = require('./app')

const { PORT, HOST, BROKER_ADDR } = require('./config')

const app = new App()

// koa-compress
{
  const compress = require('./middlewares/compress')
  app.use(compress())
}

// jsonrpc-error
{
  const jsonRpcError = require('./middlewares/error')
  app.use(jsonRpcError())
}

// koa-bodyparser
{
  const bodyParser = require('./middlewares/body-parser')
  app.use(bodyParser())
}

// jsonrpc
{
  const jsonRpc = require('./middlewares/json-rpc')
  app.use(jsonRpc({ brokerAddress: BROKER_ADDR }))
}

// starting server
http.createServer(app.callback()).listen(PORT, HOST, () => {
  console.log(`server listening on http://${HOST}${PORT !== 80 ? (':' + PORT) : ''}`)
})

// uncaught error handling
const errors = ['unhandledRejection', 'uncaughtException']
errors.forEach(event => process.on(event, console.error))

app.on('error', (err, ctx) => {
  if ((err.status >= 400 && err.status < 500) || err.expose) {
    return
  }
  console.error(err)
})

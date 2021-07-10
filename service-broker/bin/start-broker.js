#!/usr/bin/env node

const { Broker } = require('..')

new Broker().start().catch(err => {
  err.stack = 'Fatal uncaught error: ' + err.stack
  console.error(err)
  process.exit(1)
})

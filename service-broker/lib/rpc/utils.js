function validateRequest (request) {
  if (request.jsonrpc !== '2.0') {
    throw new Error('"jsonrpc" must be "2.0"')
  }

  if (request.id === undefined ||
    (typeof request.id !== 'string' && typeof request.id !== 'number' && request.id !== null)
  ) {
    throw new Error('"id" is not a string, number, or null')
  }

  if (!request.method || typeof request.method !== 'string') {
    throw new Error('"method" is not a string')
  }

  // The destination (ie. service) is actually communicated and routed by 7/MDP
  // but for the sake of consistency, let's keep the same messaging format
  const service = request.method.substring(0, request.method.indexOf('/'))
  if (!service || service.length === 0) {
    throw new Error('A service name is required')
  }

  const method = request.method.replace(service + '/', '')
  if (method.length === 0) {
    throw new Error('A method name is required')
  }

  if (request.params instanceof Array ||
    typeof request.params === 'object' ||
    typeof request.params === 'undefined') {
    // noop
  } else {
    throw new Error('"params" is not an object or array')
  }

  if (request['x-context'] !== undefined && typeof request['x-context'] !== 'object') {
    throw new Error('"x-context" is not an object or array')
  }
}

function makeResponse (id, result) {
  return {
    jsonrpc: '2.0',
    id: id,
    result
  }
}

function makeErrorResponse (id = null, error, code, message) {
  return {
    jsonrpc: '2.0',
    id,
    error: {
      code: (typeof code === 'number' && code) || (typeof error.code === 'number' && error.code) || -1,
      message: message || error.message || 'Error message not available',
      data: (error.stack || error.name)
        ? {
            stack: error.stack || undefined,
            name: error.name || undefined
          }
        : undefined
    }
  }
}

function convertRpcErrorToNative (errorObject) {
  const error = new Error(errorObject.message)
  error.code = errorObject.code

  errorObject.data = errorObject.data || {}
  error.stack = errorObject.data.stack || errorObject.stack
  error.name = errorObject.data.name || 'RpcError'

  return errorObject
}

module.exports = {
  makeResponse,
  makeErrorResponse,
  validateRequest,
  convertRpcErrorToNative
}

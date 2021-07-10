function validateRequest (request) {
  if (request.id !== undefined &&
    typeof request.id !== 'string' &&
    typeof request.id !== 'number' &&
    request.id !== null) {
    return new Error('"id" is not a string, number, or null')
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
}

function makeResponse (id, result) {
  return {
    jsonrpc: '2.0',
    id: id,
    result,
  }
}

function makeErrorResponse (id = null, error, code, message) {
  return {
    jsonrpc: '2.0',
    id,
    error: {
      code: (typeof code === 'number' && code) || (typeof error.code === 'number' && error.code) || -1,
      message: message || error.message || 'Error message not available',
      data: (error.stack || error.name) ? {
        stack: error.stack || undefined,
        name: error.name || undefined
      } : undefined
    }
  }
}

module.exports = {
  makeResponse,
  makeErrorResponse,
  validateRequest
}

exports.Header = Object.freeze({
  Client: 'MDPC01',
  Worker: 'MDPW01'
})

exports.Message = Object.freeze({
  Ready: '\x01',
  Request: '\x02',
  Reply: '\x03',
  Heartbeat: '\x04',
  Disconnect: '\x05'
})

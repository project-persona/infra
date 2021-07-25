module.exports = {
  BROKER_ADDR: process.env.BROKER_ADDR || 'tcp://0.0.0.0:5555',
  RECEIVE_TIMEOUT: parseInt(process.env.RECEIVE_TIMEOUT, 10) || 10000
}

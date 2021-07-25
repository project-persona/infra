module.exports = {
  BROKER_ADDR: process.env.BROKER_ADDR || 'tcp://0.0.0.0:5555',
  RECEIVE_TIMEOUT: parseInt(process.env.RECEIVE_TIMEOUT, 10) || 10000,
  HEARTBEAT_INTERVAL: parseInt(process.env.HEARTBEAT_TIMEOUT, 10) || 2000,
  MAX_SKIPPED_HEARTBEAT: parseInt(process.env.MAX_SKIPPED_HEARTBEAT, 10) || 3
}

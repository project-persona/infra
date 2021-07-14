module.exports = {
  // TODO: implement selective logging
  // NODE_ENV: process.env.NODE_ENV || 'production',
  HOST: process.env.HOST || '0.0.0.0',
  PORT: parseInt(process.env.PORT, 10) || 8080,
  BROKER_ADDR: process.env.BROKER_ADDR || 'tcp://0.0.0.0:5555'
}

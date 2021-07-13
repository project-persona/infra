const INIT_SYMBOL = Symbol('PRC_PROVIDER_INIT_HOOK')
const BEFORE_SYMBOL = Symbol('PRC_PROVIDER_BEFORE_HOOK')
const AFTER_SYMBOL = Symbol('PRC_PROVIDER_AFTER_HOOK')

class RpcProvider {
  constructor ({ context = { type: 'user' }, services, systemServices }) {
    this.context = context
    this.services = services
    this.systemServices = systemServices
  }

  async [INIT_SYMBOL] () {
    // noop
  }

  async [BEFORE_SYMBOL] () {
    // noop
  }

  async [AFTER_SYMBOL] () {
    // noop
  }
}

RpcProvider.init = INIT_SYMBOL
RpcProvider.before = BEFORE_SYMBOL
RpcProvider.after = AFTER_SYMBOL

module.exports = RpcProvider

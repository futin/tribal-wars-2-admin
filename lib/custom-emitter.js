// node core modules
import EventEmitter from 'events'

// 3rd party modules

// local modules

const customEmitter = new EventEmitter()

function emit (key, data) {
  customEmitter.emit(key, data)
}

function setListener ({ emitterMethod = 'once', key, listener }) {
  customEmitter[emitterMethod](key, listener)
}

export {
  emit,
  setListener
}

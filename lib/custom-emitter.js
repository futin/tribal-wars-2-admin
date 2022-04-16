// node core modules
import EventEmitter from 'events'

// 3rd party modules

// local modules

const customEmitter = new EventEmitter()

export const emit = (key, data) => customEmitter.emit(key, data)
export const setOneTimeListener = ({ key, listener }) => customEmitter.once(key, listener)
export const setListener = ({ emitterMethod = 'on', key, listener }) => customEmitter[emitterMethod](key, listener)

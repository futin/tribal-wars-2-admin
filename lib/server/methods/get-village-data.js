// node core modules
import EventEmitter from 'events'

// 3rd party modules

// local modules
import tribalWarsAdmin from '../../tw'
import { VILLAGES_DATA_MODE } from '../../constants'

/* GET */
const getUnitsCount = ({ auth }) => {
  const emitter = new EventEmitter()
  tribalWarsAdmin({ config: { auth }, mode: VILLAGES_DATA_MODE, emitter })

  return new Promise((resolve) => {
    emitter.on('close', () => resolve())
    emitter.on('data', data => resolve(data))
  })
}

export {
  // GET
  getUnitsCount
}

// node core modules

// 3rd party modules

// local modules
import tribalWarsAdmin from '../../tw'
import { VILLAGES_DATA_MODE } from '../../constants'

/* GET */
const getUnitsCount = ({ auth }) => {
  tribalWarsAdmin({ config: { auth }, mode: VILLAGES_DATA_MODE })
  return true
}

export {
  // GET
  getUnitsCount
}

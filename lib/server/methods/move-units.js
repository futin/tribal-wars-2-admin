// node core modules

// 3rd party modules

// local modules
import tribalWarsAdmin from '../../tw'
import { MASS_DONATION_MODE, MOVE_UNITS_MODE } from '../../constants'

/* SET */
const activateMassMoveUnits = ({ config }) => {
  tribalWarsAdmin({ config, mode: MOVE_UNITS_MODE })
  return true
}

const activateMassDonation = ({ config }) => {
  tribalWarsAdmin({ config, mode: MASS_DONATION_MODE })
  return true
}

export {
  // SET
  activateMassMoveUnits,
  activateMassDonation
}

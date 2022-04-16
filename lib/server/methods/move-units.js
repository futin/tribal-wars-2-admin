// node core modules

// 3rd party modules

// local modules
import tribalWarsExecutors from '#tw-executors'
import { MASS_DONATION_MODE, MOVE_UNITS_MODE } from '#global-constants'

/* SET */
const activateMassMoveUnits = ({ config }) => {
  tribalWarsExecutors({ config, mode: MOVE_UNITS_MODE })
  return true
}

const activateMassDonation = ({ config }) => {
  tribalWarsExecutors({ config, mode: MASS_DONATION_MODE })
  return true
}

export default {
  activateMassMoveUnits,
  activateMassDonation
}

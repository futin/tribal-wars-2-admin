// node core modules

// 3rd party modules

// local modules
import tribalWarsExecutors from '#tw-executors'
import { MASS_DONATION_MODE, RECRUIT_SPIES_MODE } from '#global-constants'

/* SET */
export const activateMassDonation = ({ config, auth }) => {
  config.auth = auth
  tribalWarsExecutors({ config, mode: MASS_DONATION_MODE })
  return true
}

export const activateImmediateSpyRecruit = ({ config, auth }) => {
  config.auth = auth
  tribalWarsExecutors({ config, mode: RECRUIT_SPIES_MODE })
  return true
}

// node core modules

// 3rd party modules

// local modules
import tribalWarsAdmin from '../../tw'
import { ATTACK_SCHEDULER_MODE } from '../../constants'

/* GETTERS */

/* SETTERS */
const activateImmediateAttackScheduler = ({ config }) => {
  tribalWarsAdmin({ config, mode: ATTACK_SCHEDULER_MODE })
  return true
}

export {
  // GET
  // SET
  activateImmediateAttackScheduler
}

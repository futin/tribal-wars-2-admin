// node core modules

// 3rd party modules

// local modules
import attacksTypes from './attacks.js'
import buildingUpgradesTypes from './building-upgrades.js'
import recruitsTypes from './recruits.js'

export default {
  ...attacksTypes,
  ...buildingUpgradesTypes,
  ...recruitsTypes
}

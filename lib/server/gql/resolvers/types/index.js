// node core modules

// 3rd party modules

// local modules
import attacksTypes from './farming.js'
import buildingUpgradesTypes from './building-upgrades.js'
import recruitsTypes from './recruits.js'
import resourceDepositTypes from './resource-deposit.js'
import tradingResourcesTypes from './trading-resources.js'

export default {
  ...attacksTypes,
  ...buildingUpgradesTypes,
  ...recruitsTypes,
  ...resourceDepositTypes,
  ...tradingResourcesTypes
}

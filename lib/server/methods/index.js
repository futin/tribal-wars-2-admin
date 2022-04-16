// node core modules

// 3rd party modules

// local modules
import getVillageData from './get-village-data/index.js'
import attack from './attack.js'
import attackScheduler from './attack-scheduler.js'
import buildingUpgrades from './building-upgrades.js'
import moveUnits from './move-units.js'
import overall from './overall.js'
import recruit from './recruit.js'
import * as utils from './utils.js'

export default {
  ...getVillageData,
  ...attack,
  ...attackScheduler,
  ...buildingUpgrades,
  ...moveUnits,
  ...overall,
  ...recruit,
  ...utils
}

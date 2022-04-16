// node core modules

// 3rd party modules

// local modules
import * as getVillageData from './get-village-data/index.js'
import * as attack from './attack.js'
import * as attackScheduler from './attack-scheduler.js'
import * as buildingUpgrades from './building-upgrades.js'
import * as moveUnits from './move-units.js'
import * as overall from './overall.js'
import * as recruit from './recruit.js'
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

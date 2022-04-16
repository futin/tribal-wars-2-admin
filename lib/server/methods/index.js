// node core modules

// 3rd party modules

// local modules
import * as getVillageData from './get-village-data/index.js'
import * as farming from './farming.js'
import * as attackScheduler from './attack-scheduler.js'
import * as buildingUpgrades from './building-upgrades.js'
import * as moveUnits from './move-units.js'
import * as overall from './overall.js'
import * as recruit from './recruit.js'
import * as utils from './utils.js'

export default {
  ...getVillageData,
  ...farming,
  ...attackScheduler,
  ...buildingUpgrades,
  ...moveUnits,
  ...overall,
  ...recruit,
  ...utils
}

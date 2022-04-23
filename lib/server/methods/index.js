// node core modules

// 3rd party modules

// local modules
import * as getVillagesData from './get-villages-data/index.js'
import * as farming from './farming.js'
import * as attackScheduler from './attack-scheduler.js'
import * as buildingUpgrades from './building-upgrades.js'
import * as singleInstructions from './single-instructions.js'
import * as overall from './overall.js'
import * as recruit from './recruit.js'
import * as utils from './utils.js'

export default {
  ...getVillagesData,
  ...farming,
  ...attackScheduler,
  ...buildingUpgrades,
  ...singleInstructions,
  ...overall,
  ...recruit,
  ...utils
}

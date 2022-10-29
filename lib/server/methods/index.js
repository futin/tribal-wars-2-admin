// node core modules

// 3rd party modules

// local modules
import * as getVillagesData from './get-villages-data/index.js'
import * as account from './account.js'
import * as attackScheduler from './attack-scheduler.js'
import * as buildingUpgrades from './building-upgrades.js'
import * as farming from './farming.js'
import * as relocateUnits from './move-units.js'
import * as overall from './overall.js'
import * as recruit from './recruit.js'
import * as resourceDeposit from './resource-deposit.js'
import * as schedulers from './schedulers.js'
import * as singleInstructions from './single-instructions.js'
import * as tradingResourcesInstructions from './trading-resources.js'
import * as utils from './utils.js'

export default {
  ...account,
  ...getVillagesData,
  ...attackScheduler,
  ...buildingUpgrades,
  ...farming,
  ...relocateUnits,
  ...overall,
  ...recruit,
  ...resourceDeposit,
  ...schedulers,
  ...singleInstructions,
  ...tradingResourcesInstructions,
  ...utils
}

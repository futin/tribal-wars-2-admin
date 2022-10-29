// node core modules

// 3rd party modules
import _ from 'lodash'

// local modules
import accountResolvers from './account.js'
import attackSchedulersResolvers from './attack-schedulers.js'
import buildingUpgradesResolvers from './building-upgrades.js'
import farmingResolvers from './farming.js'
import moveUnitsResolver from './move-units.js'
import overallResolvers from './overall.js'
import recruitsResolvers from './recruits.js'
import resourceDepositResolvers from './resource-deposit.js'
import schedulersResolvers from './schedulers.js'
import singleInstructionsResolvers from './single-instructions.js'
import tradingResourcesResolvers from './trading-resources.js'

const Resolvers = _.merge(
  accountResolvers,
  attackSchedulersResolvers,
  buildingUpgradesResolvers,
  farmingResolvers,
  moveUnitsResolver,
  overallResolvers,
  recruitsResolvers,
  resourceDepositResolvers,
  schedulersResolvers,
  singleInstructionsResolvers,
  tradingResourcesResolvers
)

export default Resolvers

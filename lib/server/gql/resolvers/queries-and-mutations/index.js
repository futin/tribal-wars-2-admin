// node core modules

// 3rd party modules
import _ from 'lodash'

// local modules
import attackSchedulersResolvers from './attack-schedulers.js'
import buildingUpgradesResolvers from './building-upgrades.js'
import farmingResolvers from './farming.js'
import moveUnitsResolver from './move-units.js'
import overallResolvers from './overall.js'
import recruitsResolvers from './recruits.js'
import singleInstructionsResolvers from './single-instructions.js'
import tradingResourcesResolvers from './trading-resources.js'

const Resolvers = _.merge(
  attackSchedulersResolvers,
  buildingUpgradesResolvers,
  farmingResolvers,
  moveUnitsResolver,
  overallResolvers,
  recruitsResolvers,
  singleInstructionsResolvers,
  tradingResourcesResolvers
)

export default Resolvers

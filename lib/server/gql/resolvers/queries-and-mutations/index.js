// node core modules

// 3rd party modules
import _ from 'lodash'

// local modules
import attackSchedulersResolvers from './attack-schedulers.js'
import farmingResolvers from './farming.js'
import buildingUpgradesResolvers from './building-upgrades.js'
import overallResolvers from './overall.js'
import recruitsResolvers from './recruits.js'
import singleInstructionsResolvers from './single-instructions.js'

const Resolvers = _.merge(
  attackSchedulersResolvers,
  farmingResolvers,
  buildingUpgradesResolvers,
  overallResolvers,
  recruitsResolvers,
  singleInstructionsResolvers
)

export default Resolvers

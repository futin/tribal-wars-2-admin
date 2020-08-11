// node core modules

// 3rd party modules

// local modules
import { includeAllFiles } from '../../../utils'

const resolvers = includeAllFiles({ pathToDirectory: __dirname, reduceToObjects: true })

export default resolvers

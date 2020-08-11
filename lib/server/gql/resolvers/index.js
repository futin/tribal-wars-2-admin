// node core modules

// 3rd party modules

// local modules
import { includeAllFiles } from '../../../utils'

const resolvers = includeAllFiles({ pathToDirectory: __dirname, loadDefault: true, reduceToObjects: true })

export default resolvers

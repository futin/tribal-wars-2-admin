// node core modules

// 3rd party modules

// local modules
import { includeAllFiles } from '../../utils'

const methods = includeAllFiles({ pathToDirectory: __dirname, loadDefault: true, reduceToObjects: true })

export default methods

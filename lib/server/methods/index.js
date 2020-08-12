// node core modules

// 3rd party modules

// local modules
import { includeAllFiles } from '../../utils'

const methods = includeAllFiles({ pathToDirectory: __dirname, reduceToObjects: true, loadDefault: false })

export default methods

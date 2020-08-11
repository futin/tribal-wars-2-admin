// node core modules

// 3rd party modules

// local modules
import { includeAllFiles } from '../../../../utils'

const rootResolvers = includeAllFiles({ pathToDirectory: __dirname, loadDefault: true, applyMerge: true })

export default rootResolvers

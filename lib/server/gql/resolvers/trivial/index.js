// node core modules

// 3rd party modules

// local modules
import { includeAllFiles } from '../../../../utils'

const trivialResolvers = includeAllFiles({ pathToDirectory: __dirname, applyMerge: true })

export default trivialResolvers

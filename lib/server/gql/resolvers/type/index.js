// node core modules

// 3rd party modules

// local modules
import { includeAllFiles } from '../../../../utils'

const typeResolvers = includeAllFiles({ pathToDirectory: __dirname, applyMerge: true })

export default typeResolvers

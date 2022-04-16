// node core modules

// 3rd party modules

// local modules
import queriesAndMutations from './queries-and-mutations/index.js'
import scalars from './scalars/index.js'
import types from './types/index.js'

export default {
  ...queriesAndMutations,
  ...scalars,
  ...types
}

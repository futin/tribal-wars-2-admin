// node core modules

// 3rd party modules

// local modules
import { toMongoId } from './utils'

function deleteById (id, callback) {
  return this.deleteOne({ _id: toMongoId(id) }, callback)
}

export {
  deleteById
}

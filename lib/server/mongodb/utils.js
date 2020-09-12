// node core modules

// 3rd party modules
import mongoose from 'mongoose'

// local modules

const toMongoId = id => mongoose.Types.ObjectId(id)

export {
  toMongoId
}

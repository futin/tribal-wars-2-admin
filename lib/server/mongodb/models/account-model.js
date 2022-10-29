// core node modules

// 3rd party modules
import mongoose from 'mongoose'

// internal modules

const { Schema } = mongoose

const AccountSchema = Schema({
  userName: String,
  worldName: String,
  uniqueId: String,
  token: String,
  createdAt: Date
})

export default mongoose.model('Account', AccountSchema, 'accounts')

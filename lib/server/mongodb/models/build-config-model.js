// core node modules

// 3rd party modules
const mongoose = require('mongoose')

// internal modules

const { Schema } = mongoose

const configSchema = Schema({
  villageName: String,
  buildingOrder: [String],
  buildingPriority: String
}, { _id: false })

const BuildConfigSchema = Schema({
  config: configSchema,
  executedTimes: Number,
  executedAt: Date,
  nextExecutionAt: Date,
  createdAt: Date
})

export default {
  BuildConfig: mongoose.model('BuildConfig', BuildConfigSchema, 'build_configs')
}

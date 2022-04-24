// core node modules

// 3rd party modules
import mongoose from 'mongoose'

// internal modules

const { Schema } = mongoose

const configSchema = Schema({
  minRetrialIntervalInMinutes: Number,
  originVillageAvailableProvisionsThreshold: Number,
  maxRelocationOperationsPerVillage: Number,
  maxRelocationUnitsPerVillage: Number,
  presetsNameStartsWith: String,
  originVillageNamesToIgnore: [String],
  targetVillageNamesToIgnore: [String]
}, { _id: false })

const MoveUnitsConfigSchema = Schema({
  config: configSchema,
  executedTimes: Number,
  executedAt: Date,
  nextExecutionAt: Date,
  createdAt: Date
})

export default mongoose.model('MoveUnitsConfig', MoveUnitsConfigSchema, 'move_units_configs')

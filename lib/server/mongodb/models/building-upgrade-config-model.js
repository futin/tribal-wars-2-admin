// core node modules

// 3rd party modules
import mongoose from 'mongoose'

// internal modules

const { Schema } = mongoose

const configSchema = Schema({
  villageName: String,
  buildingOrder: [String],
  buildingPriority: String
}, { _id: false })

const BuildingUpgradeConfigSchema = Schema({
  config: configSchema,
  executedTimes: Number,
  failedTimes: Number,
  executedAt: Date,
  nextExecutionAt: Date,
  createdAt: Date
})

export default mongoose.model('BuildingUpgradeConfig', BuildingUpgradeConfigSchema, 'building_upgrade_configs')

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

const BuildingUpgradeConfigSchema = Schema({
  config: configSchema,
  executedTimes: Number,
  executedAt: Date,
  nextExecutionAt: Date,
  createdAt: Date
})

export default {
  BuildingUpgradeConfig: mongoose.model('BuildingUpgradeConfig', BuildingUpgradeConfigSchema, 'building_upgrade_configs')
}

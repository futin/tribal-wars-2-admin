// core node modules

// 3rd party modules
import mongoose from 'mongoose'

// internal modules

const { Schema } = mongoose

const maxLevelPerBuildingNameSchema = Schema({
  wood: Number,
  clayPit: Number,
  ironMine: Number,
  warehouse: Number,
  hospital: Number,
  tavern: Number,
  market: Number,
  rallyPoint: Number,
  statue: Number,
  headquarter: Number,
  barracks: Number,
  farm: Number,
  wall: Number
}, { _id: false })

const configSchema = Schema({
  villageName: String,
  buildingCommands: [String],
  buildingPriority: String,
  maxLevelPerBuildingName: maxLevelPerBuildingNameSchema
}, { _id: false })

const BuildingUpgradeConfigSchema = Schema({
  config: configSchema,
  accountId: String,
  executedTimes: Number,
  failedTimes: Number,
  executedAt: Date,
  nextExecutionAt: Date,
  createdAt: Date
})

export default mongoose.model('BuildingUpgradeConfig', BuildingUpgradeConfigSchema, 'building_upgrade_configs')

// core node modules

// 3rd party modules
import mongoose from 'mongoose'

// internal modules

const { Schema } = mongoose

const configSchema = Schema({
  minRetrialIntervalInMinutes: Number,
  sourceVillageAvailableResourcesHighThresholdInPercent: Number,
  sourceVillageAvailableResourcesThresholdInPercent: Number,
  targetVillageAvailableResourcesLowThresholdInPercent: Number,
  targetVillageAvailableResourcesThresholdInPercent: Number,
  sourceVillageNamesToIgnore: [String],
  targetVillageNamesToIgnore: [String],
  maxTransportsToUseInPercent: Number
}, { _id: false })

const TradingResourcesConfigSchema = Schema({
  config: configSchema,
  executedTimes: Number,
  failedTimes: Number,
  executedAt: Date,
  nextExecutionAt: Date,
  createdAt: Date
})

export default mongoose.model('TradingResourcesConfig', TradingResourcesConfigSchema, 'trading_resources_configs')

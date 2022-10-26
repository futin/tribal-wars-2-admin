// core node modules

// 3rd party modules
import mongoose from 'mongoose'

// internal modules

const { Schema } = mongoose

const UnitsSchema = Schema({
  archer: Number,
  axe: Number,
  catapult: Number,
  doppelsoldner: Number,
  heavy_cavalry: Number,
  knight: Number,
  light_cavalry: Number,
  mounted_archer: Number,
  ram: Number,
  snob: Number,
  spear: Number,
  sword: Number,
  trebuchet: Number
}, { _id: false })

const configSchema = Schema({
  units: UnitsSchema,
  accountId: String,
  minRetrialIntervalInMinutes: Number,
  sourceVillageAvailableProvisionsThreshold: Number,
  targetVillageAvailableProvisionsThreshold: Number,
  maxRelocationOperationsPerVillage: Number,
  maxRelocationUnitsPerVillage: Number,
  presetsNameStartsWith: String,
  sourceVillageNamesToIgnore: [String],
  targetVillageNamesToIgnore: [String],
  presetConfigName: String
}, { _id: false })

const RelocateUnitsConfig = Schema({
  config: configSchema,
  executedTimes: Number,
  executedAt: Date,
  nextExecutionAt: Date,
  createdAt: Date
})

export default mongoose.model('RelocateUnitsConfig', RelocateUnitsConfig, 'relocate_units_configs')

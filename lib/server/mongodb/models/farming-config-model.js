// core node modules

// 3rd party modules
import mongoose from 'mongoose'

// internal modules

const { Schema } = mongoose

const PlayerVillageAttackSchema = Schema({
  name: String,
  preferredPresetsOrder: [String],
  maxOutgoingAttacksAllowed: Number
}, { _id: false })

const BarbarianVillagesAreaSchema = Schema({
  width: Number,
  height: Number
}, { _id: false })

const BarbarianVillagesToIgnoreSchema = Schema({
  toAttack: Boolean,
  fromAttack: Boolean
}, { _id: false })

const configSchema = Schema({
  barbarianVillagesArea: BarbarianVillagesAreaSchema,
  barbarianVillagesToIgnore: BarbarianVillagesToIgnoreSchema,
  playerVillagesToAllow: [PlayerVillageAttackSchema],
  accountId: String,
  minRetrialIntervalInMinutes: Number,
  maxOutgoingAttacksAllowed: Number,
  presetsNameStartsWith: String,
  playerVillageNamesToIgnore: [String],
  barbarianVillageNamesToIgnore: [String],
  maxNonBarbarianVillagesPoints: Number,
  maxAllowedAvailableResourcesInPercentage: Number
}, { _id: false })

const FarmingConfigSchema = Schema({
  config: configSchema,
  executedTimes: Number,
  executedAt: Date,
  nextExecutionAt: Date,
  createdAt: Date
})

export default mongoose.model('FarmingConfig', FarmingConfigSchema, 'farming_configs')

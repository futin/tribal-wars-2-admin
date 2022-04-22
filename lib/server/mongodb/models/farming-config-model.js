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
  maxOutgoingAttacksAllowed: Number,
  presetsNameStartsWith: String,
  playerVillageNamesToIgnore: [String],
  barbarianVillageNamesToIgnore: [String],
  maxNonBarbarianVillagesPoints: Number,
  playerVillagesToAllow: [PlayerVillageAttackSchema],
  barbarianVillagesArea: BarbarianVillagesAreaSchema,
  barbarianVillagesToIgnore: BarbarianVillagesToIgnoreSchema
}, { _id: false })

const FarmingConfigSchema = Schema({
  config: configSchema,
  minimumIntervalInMinutes: Number,
  executedTimes: Number,
  executedAt: Date,
  nextExecutionAt: Date,
  createdAt: Date
})

export default mongoose.model('FarmingConfig', FarmingConfigSchema, 'farming_configs')

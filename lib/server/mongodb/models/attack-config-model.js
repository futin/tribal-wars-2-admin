// core node modules

// 3rd party modules
const mongoose = require('mongoose')

// internal modules

const { Schema } = mongoose

const PlayerVillageAttackSchema = Schema({
  name: String,
  preferredPresetsOrder: [String]
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
  presetsNameStartsWith: String,
  playerVillageNamesToIgnore: [String],
  barbarianVillageNamesToIgnore: [String],
  nonBarbarianVillagesPointsLimit: Number,
  playerVillagesToAllow: [PlayerVillageAttackSchema],
  barbarianVillagesArea: BarbarianVillagesAreaSchema,
  barbarianVillagesToIgnore: BarbarianVillagesToIgnoreSchema
}, { _id: false })

const AttackConfigSchema = Schema({
  config: configSchema,
  minimumIntervalInMinutes: Number,
  executedTimes: Number,
  executedAt: Date,
  nextExecutionAt: Date,
  createdAt: Date
})

export default {
  AttackConfig: mongoose.model('AttackConfig', AttackConfigSchema, 'attack_configs')
}

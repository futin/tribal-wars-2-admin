// core node modules

// 3rd party modules
const mongoose = require('mongoose')

// internal modules

const { Schema } = mongoose

const TargetSchema = Schema({
  name: String,
  x: Number,
  y: Number,
  launchTime: String,
  travelTime: String
}, { _id: false })

const PresetConfigSchema = Schema({
  name: String,
  waitBetweenAttacksInMs: Number,
  numberOfAttacks: Number
}, { _id: false })

const AttackSchedulerSchema = Schema({
  name: String,
  x: Number,
  y: Number,
  createdAt: Date,
  unitType: String,
  arrivalDate: String,
  timezone: String,
  targets: [TargetSchema],
  presetConfigs: [PresetConfigSchema]
})

export default {
  AttackScheduler: mongoose.model('AttackScheduler', AttackSchedulerSchema, 'attack_schedulers')
}

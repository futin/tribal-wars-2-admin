// core node modules

// 3rd party modules
const mongoose = require('mongoose')

// internal modules

const { Schema } = mongoose

const TargetSchema = Schema({
  id: String,
  name: String,
  x: Number,
  y: Number,
  launchTime: String,
  travelTime: String
}, { _id: false })

const presetConfigSchema = Schema({
  name: String,
  waitBetweenAttacksInMs: Number,
  numberOfAttacks: Number
}, { _id: false })

const AttackSchedulerSchema = Schema({
  name: String,
  x: Number,
  y: Number,
  createdAt: Date,
  executeAt: Date,
  isExecuted: Boolean,
  chainId: Schema.Types.ObjectId,
  unitType: String,
  arrivalDate: String,
  timezone: String,
  target: TargetSchema,
  presetConfig: presetConfigSchema
})

export default {
  AttackScheduler: mongoose.model('AttackScheduler', AttackSchedulerSchema, 'attack_schedulers')
}

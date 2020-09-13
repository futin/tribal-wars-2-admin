// core node modules

// 3rd party modules
const mongoose = require('mongoose')

// internal modules

const { Schema } = mongoose

const RecruitmentInstructionsSchema = Schema({
  amount: Number,
  unitType: String,
  isHOO: Boolean
}, { _id: false })

const PlayerVillageRecruitSchema = Schema({
  name: String,
  recruitmentInstructions: [RecruitmentInstructionsSchema]
}, { _id: false })

const configSchema = Schema({
  playerVillageNamesToIgnore: [String],
  recruitmentInstructions: [RecruitmentInstructionsSchema],
  playerVillagesToAllow: [PlayerVillageRecruitSchema]
}, { _id: false })

const AttackConfigSchema = Schema({
  minimumIntervalInMinutes: Number,
  config: configSchema,
  executedTimes: Number,
  executedAt: Date,
  nextExecutionAt: Date,
  createdAt: Date
})

export default {
  RecruitConfig: mongoose.model('RecruitConfig', AttackConfigSchema, 'recruit_configs')
}

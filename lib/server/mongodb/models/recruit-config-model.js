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
  groupNames: [String],
  playerVillageNamesToIgnore: [String],
  recruitmentInstructions: [RecruitmentInstructionsSchema],
  playerVillagesToAllow: [PlayerVillageRecruitSchema]
}, { _id: false })

const AttackConfigSchema = Schema({
  config: configSchema,
  executedTimes: Number,
  executedAt: Date,
  nextExecutionAt: Date,
  createdAt: Date
})

export default {
  RecruitConfig: mongoose.model('RecruitConfig', AttackConfigSchema, 'recruit_configs')
}

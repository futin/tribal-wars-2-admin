// core node modules

// 3rd party modules
import mongoose from 'mongoose'

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
  minRetrialIntervalInMinutes: Number,
  groupNames: [String],
  playerVillageNamesToIgnore: [String],
  recruitmentInstructions: [RecruitmentInstructionsSchema],
  playerVillagesToAllow: [PlayerVillageRecruitSchema]
}, { _id: false })

const RecruitConfigSchema = Schema({
  config: configSchema,
  executedTimes: Number,
  failedTimes: Number,
  executedAt: Date,
  nextExecutionAt: Date,
  createdAt: Date
})

export default mongoose.model('RecruitConfig', RecruitConfigSchema, 'recruit_configs')

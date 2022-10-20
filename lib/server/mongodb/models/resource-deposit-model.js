// core node modules

// 3rd party modules
import mongoose from 'mongoose'

// internal modules

const { Schema } = mongoose

const configSchema = Schema({
  minRetrialIntervalInMinutes: Number,
  nextResourceDepositJobPriority: String,
  villageToCollectResourceDepositPriority: String
}, { _id: false })

const ResourceDepositConfigSchema = Schema({
  config: configSchema,
  executedTimes: Number,
  failedTimes: Number,
  executedAt: Date,
  nextExecutionAt: Date,
  createdAt: Date
})

export default mongoose.model('ResourceDepositConfig', ResourceDepositConfigSchema, 'resource_deposit_configs')

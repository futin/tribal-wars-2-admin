// core node modules

// 3rd party modules
import mongoose from 'mongoose'

// internal modules

const { Schema } = mongoose

const SchedulerSchema = Schema({
  accountId: String,
  executionIntervalInMinutes: Number,
  type: String,
  createdAt: Date
})

export default mongoose.model('Scheduler', SchedulerSchema, 'schedulers')

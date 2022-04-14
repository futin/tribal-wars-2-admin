// node core modules
import EventEmitter from 'events'

// 3rd party modules
import { delay } from 'promises-to-retry'
import moment from 'moment-timezone'

// local modules
import { roundRandomWithRange } from '@global-utils'
import { NEXT_EXECUTION_OFFSET, RECRUIT_UNITS_MODE } from '@global-constants'

export default async function executeRecruitOperations ({ executedAt, queryExecutionDue, models, auth, tribalWarsExecutors }) {
  // execute scheduled recruits
  const recruitsToExecute = await models.RecruitConfig.find(queryExecutionDue).lean()

  console.log(`Executing scheduled [${recruitsToExecute.length}] recruits`)
  if (recruitsToExecute.length) {
    for (const { _id, config } of recruitsToExecute) {
      if (!config) continue
      const emitter = new EventEmitter()
      tribalWarsExecutors({ config: { ...config, auth }, emitter, mode: RECRUIT_UNITS_MODE })

      emitter.once('data', async ({ timeCompleted }) => {
        let nextExecutionAt = moment.utc().add(60, 'minutes').toDate()
        if (timeCompleted) {
          const endTimeInMs = timeCompleted * 1000 - NEXT_EXECUTION_OFFSET
          nextExecutionAt = moment.utc(endTimeInMs).toDate()
        }

        await models.RecruitConfig.updateOne({ _id }, { $set: { executedAt, nextExecutionAt }, $inc: { executedTimes: 1 } })
      })

      emitter.once('close', async ({ errorCode }) => {
        const nextExecutionAt = moment.utc().add(60, 'minutes').toDate()
        const setter = { executedAt, nextExecutionAt }

        if (errorCode === 'InvalidInstructions') setter.isInvalid = true
        await models.RecruitConfig.updateOne({ _id }, { $set: setter, $inc: { executedTimes: 1 } })
      })

      await delay(roundRandomWithRange({ min: 2, max: 4 }) * 1000)
    }
  }
}

// node core modules

// 3rd party modules
import { delay } from 'promises-to-retry'
import moment from 'moment-timezone'

// local modules
import { roundRandomWithRange } from '@global-utils'
import { NEXT_EXECUTION_OFFSET, RECRUIT_UNITS_MODE } from '@global-constants'
import { setOneTimeListener } from '@custom-emitter'

export default async function executeRecruitOperations ({ executedAt, queryExecutionDue, models, auth, tribalWarsExecutors }) {
  const recruitsToExecute = await models.RecruitConfig.find({ ...queryExecutionDue, isInvalid: { $ne: true } }).lean()

  console.log(`Executing scheduled [${recruitsToExecute.length}] recruits`)
  if (recruitsToExecute.length) {
    for (const { _id, config } of recruitsToExecute) {
      if (!config) continue
      const id = _id.toString()

      tribalWarsExecutors({ config: { ...config, auth }, emitterKey: id, mode: RECRUIT_UNITS_MODE })

      setOneTimeListener({
        key: id,
        listener: async ({ isError, errorCode, payload }) => {
          if (isError || errorCode || !payload) {
            const nextExecutionAt = moment.utc().add(60, 'minutes').toDate()
            const setter = { executedAt, nextExecutionAt }

            if (errorCode === 'InvalidInstructions') setter.isInvalid = true
            await models.RecruitConfig.updateOne({ _id }, { $set: setter, $inc: { executedTimes: 1 } })
            return
          }

          const { timeCompleted } = payload
          let nextExecutionAt = moment.utc().add(60, 'minutes').toDate()
          if (timeCompleted) {
            const endTimeInMs = timeCompleted * 1000 - NEXT_EXECUTION_OFFSET
            nextExecutionAt = moment.utc(endTimeInMs).toDate()
          }

          await models.RecruitConfig.updateOne({ _id }, { $set: { executedAt, nextExecutionAt }, $inc: { executedTimes: 1 } })
        }
      })

      await delay(roundRandomWithRange({ min: 2, max: 4 }) * 1000)
    }
  }
}

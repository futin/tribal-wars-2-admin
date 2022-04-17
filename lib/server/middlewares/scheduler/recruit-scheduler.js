// node core modules

// 3rd party modules
import moment from 'moment-timezone'

// local modules
import { NEXT_EXECUTION_OFFSET, RECRUIT_UNITS_MODE } from '#global-constants'
import { setOneTimeListener } from '#custom-emitter'
import { delay } from 'promises-to-retry'
import { roundRandomWithRange } from '#global-utils'

async function executeAutomaticRecruitOperations ({ recruitsToExecute, executedAt, models, auth, tribalWarsExecutors }) {
  console.log(`Scheduled recruits left: [${recruitsToExecute.length}]`)

  if (!recruitsToExecute.length) return
  const { _id, config } = recruitsToExecute.shift()
  if (!config) return executeAutomaticRecruitOperations({ recruitsToExecute, executedAt, models, auth, tribalWarsExecutors })
  const id = _id.toString()

  tribalWarsExecutors({ config: { ...config, auth }, emitterKey: id, mode: RECRUIT_UNITS_MODE })

  return new Promise((resolve) => {
    setOneTimeListener({
      key: id,
      listener: async ({ isError, errorCode, payload }) => {
        if (isError || errorCode || !payload) {
          const nextExecutionAt = moment.utc().add(60, 'minutes').toDate()
          const setter = { executedAt, nextExecutionAt }

          if (errorCode === 'InvalidInstructions') setter.isInvalid = true
          await models.RecruitConfig.updateOne({ _id }, { $set: setter, $inc: { executedTimes: 1 } })
        } else {
          const { timeCompleted } = payload
          let nextExecutionAt = moment.utc().add(60, 'minutes').toDate()
          if (timeCompleted) {
            const endTimeInMs = timeCompleted * 1000 - NEXT_EXECUTION_OFFSET
            nextExecutionAt = moment.utc(endTimeInMs).toDate()
          }

          await models.RecruitConfig.updateOne({ _id }, { $set: { executedAt, nextExecutionAt }, $inc: { executedTimes: 1 } })
        }

        await delay(roundRandomWithRange({ min: 1, max: 3 }) * 1000)
        return resolve(executeAutomaticRecruitOperations({ recruitsToExecute, executedAt, models, auth, tribalWarsExecutors }))
      }
    })
  })
}

export default async function executeRecruitOperations ({ executedAt, queryExecutionDue, models, auth, tribalWarsExecutors }) {
  const recruitsToExecute = await models.RecruitConfig.find({ ...queryExecutionDue, isInvalid: { $ne: true } }).lean()
  return executeAutomaticRecruitOperations({ recruitsToExecute, executedAt, models, auth, tribalWarsExecutors })
}

// node core modules

// 3rd party modules
import moment from 'moment-timezone'
import { delay } from 'promises-to-retry'

// local modules
import { RESOURCE_DEPOSIT_MODE } from '#global-constants'
import { setOneTimeListener } from '#custom-emitter'
import { roundRandomWithRange } from '#global-utils'

async function executeAutomaticResourceDepositOperations ({ resourceDepositsToExecute, executedAt, models, auth, tribalWarsExecutors }) {
  console.log(`Scheduled resourceDeposits left: [${resourceDepositsToExecute.length}]`)

  if (!resourceDepositsToExecute.length) return
  const { _id, config } = resourceDepositsToExecute.shift()
  if (!config) return executeAutomaticResourceDepositOperations({ resourceDepositsToExecute, executedAt, models, auth, tribalWarsExecutors })
  const id = _id.toString()

  config.auth = auth
  tribalWarsExecutors({ config, emitterKey: id, mode: RESOURCE_DEPOSIT_MODE })

  return new Promise((resolve) => {
    setOneTimeListener({
      key: id,
      listener: async ({ isError, errorCode, payload }) => {
        if (isError || errorCode || !payload) {
          const nextExecutionAt = moment.utc().add(60, 'minutes').toDate()
          const setter = { executedAt, nextExecutionAt }

          await models.ResourceDepositConfig.updateOne({ _id }, { $set: setter, $inc: { executedTimes: 1 } })
        } else {
          const { timeCompleted } = payload
          const { minRetrialIntervalInMinutes } = config
          let nextExecutionAt = moment.utc().add(60, 'minutes').toDate()

          // if minimum retrial interval is provided, it has precedence
          if (minRetrialIntervalInMinutes) {
            nextExecutionAt = moment.utc().add(minRetrialIntervalInMinutes, 'minutes').toDate()
          } else if (timeCompleted) {
            const endTimeInMs = timeCompleted * 1000
            nextExecutionAt = moment.utc(endTimeInMs).toDate()
          }

          await models.ResourceDepositConfig.updateOne({ _id }, { $set: { executedAt, nextExecutionAt }, $inc: { executedTimes: 1 } })
        }

        await delay(roundRandomWithRange({ min: 1, max: 3 }) * 1000)
        return resolve(executeAutomaticResourceDepositOperations({ resourceDepositsToExecute, executedAt, models, auth, tribalWarsExecutors }))
      }
    })
  })
}

export default async function executeResourceDepositOperations ({ executedAt, queryExecutionDue, models, auth, tribalWarsExecutors }) {
  const resourceDepositsToExecute = await models.ResourceDepositConfig.find({ ...queryExecutionDue, isInvalid: { $ne: true } }).lean()
  return executeAutomaticResourceDepositOperations({ resourceDepositsToExecute, executedAt, models, auth, tribalWarsExecutors })
}

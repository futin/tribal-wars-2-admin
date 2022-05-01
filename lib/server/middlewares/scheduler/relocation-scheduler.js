// node core modules

// 3rd party modules
import { delay } from 'promises-to-retry'
import moment from 'moment-timezone'

// local modules
import { roundRandomWithRange } from '#global-utils'
import { RELOCATE_UNITS_MODE } from '#global-constants'
import { setOneTimeListener } from '#custom-emitter'

async function executeAutomaticRelocationUnitsOperations ({ relocationUnitsToExecute, executedAt, models, auth, tribalWarsExecutors }) {
  console.log(`Scheduled relocation units left: [${relocationUnitsToExecute.length}]`)
  if (!relocationUnitsToExecute.length) return
  const { _id, config } = relocationUnitsToExecute.shift()
  if (!config) return executeAutomaticRelocationUnitsOperations({ relocationUnitsToExecute, executedAt, models, auth, tribalWarsExecutors })
  const id = _id.toString()

  config.auth = auth
  tribalWarsExecutors({ config, emitterKey: id, mode: RELOCATE_UNITS_MODE })

  return new Promise((resolve) => {
    setOneTimeListener({
      key: id,
      listener: async () => {
        const { minRetrialIntervalInMinutes } = config
        const nextExecutionAt = moment.utc().add(minRetrialIntervalInMinutes, 'minutes').toDate()
        await models.RelocateUnitsConfig.updateOne({ _id }, { $set: { executedAt, nextExecutionAt }, $inc: { executedTimes: 1 } })

        await delay(roundRandomWithRange({ min: 1, max: 3 }) * 1000)
        return resolve(executeAutomaticRelocationUnitsOperations({ relocationUnitsToExecute, executedAt, models, auth, tribalWarsExecutors }))
      }
    })
  })
}

export default async function executeRelocationUnitsOperations ({ executedAt, queryExecutionDue, models, auth, tribalWarsExecutors }) {
  const relocationUnitsToExecute = await models.RelocateUnitsConfig.find(queryExecutionDue).lean()
  return executeAutomaticRelocationUnitsOperations({ relocationUnitsToExecute, executedAt, models, auth, tribalWarsExecutors })
}

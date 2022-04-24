// node core modules

// 3rd party modules
import { delay } from 'promises-to-retry'
import moment from 'moment-timezone'
import _ from 'lodash'

// local modules
import { roundRandomWithRange } from '#global-utils'
import { FARMING_MODE } from '#global-constants'

export default async function executeFarmingOperations ({ executedAt, queryExecutionDue, models, auth, tribalWarsExecutors }) {
  const farmingAttacksToExecute = await models.FarmingConfig.find(queryExecutionDue).lean()
  console.log(`Executing scheduled [${farmingAttacksToExecute.length}] farming attacks`)

  if (farmingAttacksToExecute.length) {
    for (const { _id, config } of farmingAttacksToExecute) {
      if (!config) continue

      const { minRetrialIntervalInMinutes } = config
      config.auth = auth
      tribalWarsExecutors({ config, mode: FARMING_MODE })

      const nextExecutionAt = moment.utc().add(minRetrialIntervalInMinutes, 'minutes').toDate()
      await models.FarmingConfig.updateOne({ _id }, { $set: { executedAt, nextExecutionAt }, $inc: { executedTimes: 1 } })
      await delay(roundRandomWithRange({ min: 1, max: 3 }) * 1000)
    }
  }
}

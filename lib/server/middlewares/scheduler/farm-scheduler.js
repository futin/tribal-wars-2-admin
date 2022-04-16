// node core modules

// 3rd party modules
import { delay } from 'promises-to-retry'
import moment from 'moment-timezone'

// local modules
import { roundRandomWithRange } from '#global-utils'
import { ATTACK_MODE } from '#global-constants'

export default async function executeFarmOperations ({ executedAt, queryExecutionDue, models, auth, tribalWarsExecutors }) {
  const attacksToExecute = await models.AttackConfig.find(queryExecutionDue).lean()
  console.log(`Executing scheduled [${attacksToExecute.length}] attacks`)

  if (attacksToExecute.length) {
    for (const { _id, config, minimumIntervalInMinutes } of attacksToExecute) {
      if (!config) continue
      tribalWarsExecutors({ config: { ...config, auth }, mode: ATTACK_MODE })
      const nextExecutionAt = moment.utc().add(minimumIntervalInMinutes, 'minutes').toDate()
      await models.AttackConfig.updateOne({ _id }, { $set: { executedAt, nextExecutionAt }, $inc: { executedTimes: 1 } })
      await delay(roundRandomWithRange({ min: 1, max: 3 }) * 1000)
    }
  }
}

// node core modules
import EventEmitter from 'events'

// 3rd party modules
import { delay } from 'promises-to-retry'
import moment from 'moment-timezone'

// local modules
import { roundRandomWithRange } from '../../../utils'
import { NEXT_EXECUTION_OFFSET, BUILDING_UPGRADES_MODE } from '../../../constants'

export default async function executeBuildingUpgradesOperations ({ executedAt, queryExecutionDue, models, auth, tribalWarsAdmin }) {
  const buildingUpgradesToExecute = await models.BuildingUpgradeConfig.find(queryExecutionDue).lean()
  console.log(`Executing scheduled [${buildingUpgradesToExecute.length}] building upgrades`)

  if (buildingUpgradesToExecute.length) {
    for (const { _id, config } of buildingUpgradesToExecute) {
      if (!config) continue

      const emitter = new EventEmitter()
      tribalWarsAdmin({ config: { ...config, auth }, emitter, mode: BUILDING_UPGRADES_MODE })

      emitter.once('data', async ({ queue }) => {
        if (!queue.length) {
          const nextExecutionAt = moment.utc().add(60, 'minutes').toDate()
          console.log('Something went wrong, queue should not be empty')
          await models.BuildingUpgradeConfig.updateOne({ _id }, { $set: { executedAt, nextExecutionAt }, $inc: { executedTimes: 1, failedTimes: 1 } })
          return false
        }

        const endTimeInMs = queue[queue.length - 1].timeCompleted * 1000 - NEXT_EXECUTION_OFFSET
        const nextExecutionAt = moment.utc(endTimeInMs).toDate()

        await models.BuildingUpgradeConfig.updateOne({ _id }, { $set: { executedAt, nextExecutionAt }, $inc: { executedTimes: 1 } })
      })

      await delay(roundRandomWithRange({ min: 5, max: 15 }) * 1000)
    }
  }
}

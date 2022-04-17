// node core modules

// 3rd party modules
import { delay } from 'promises-to-retry'
import moment from 'moment-timezone'

// local modules
import { roundRandomWithRange } from '#global-utils'
import { NEXT_EXECUTION_OFFSET, BUILDING_UPGRADES_MODE } from '#global-constants'
import { setOneTimeListener } from '#custom-emitter'

export default async function executeBuildingUpgradesOperations ({ executedAt, queryExecutionDue, models, auth, tribalWarsExecutors }) {
  const buildingUpgradesToExecute = await models.BuildingUpgradeConfig.find(queryExecutionDue).lean()
  console.log(`Executing scheduled [${buildingUpgradesToExecute.length}] building upgrades`)

  if (buildingUpgradesToExecute.length) {
    for (const { _id, config } of buildingUpgradesToExecute) {
      if (!config) continue
      const id = _id.toString()

      tribalWarsExecutors({ config: { ...config, auth }, emitterKey: id, mode: BUILDING_UPGRADES_MODE })

      setOneTimeListener({
        key: id,
        listener: async ({ isError, message, payload }) => {
          if (isError || !payload) {
            console.log('getVillagesData():', message)
            return
          }

          const { queue } = payload
          if (!queue?.length) {
            const nextExecutionAt = moment.utc().add(60, 'minutes').toDate()
            console.log('Something went wrong, queue should not be empty')
            await models.BuildingUpgradeConfig.updateOne({ _id }, { $set: { executedAt, nextExecutionAt }, $inc: { executedTimes: 1, failedTimes: 1 } })
            return false
          }

          const endTimeInMs = queue[queue.length - 1].timeCompleted * 1000 - NEXT_EXECUTION_OFFSET
          const nextExecutionAt = moment.utc(endTimeInMs).toDate()

          await models.BuildingUpgradeConfig.updateOne({ _id }, { $set: { executedAt, nextExecutionAt }, $inc: { executedTimes: 1 } })
        }
      })

      await delay(roundRandomWithRange({ min: 5, max: 15 }) * 1000)
    }
  }
}

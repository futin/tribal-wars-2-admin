// node core modules

// 3rd party modules
import { delay } from 'promises-to-retry'
import moment from 'moment-timezone'

// local modules
import { roundRandomWithRange } from '#global-utils'
import { NEXT_EXECUTION_OFFSET, BUILDING_UPGRADES_MODE } from '#global-constants'
import { setOneTimeListener } from '#custom-emitter'

async function executeAutomaticBuildingUpgradesOperations ({ buildingUpgradesToExecute, executedAt, models, auth, tribalWarsExecutors }) {
  console.log(`Scheduled building upgrades left: [${buildingUpgradesToExecute.length}]`)
  if (!buildingUpgradesToExecute.length) return
  const { _id, config } = buildingUpgradesToExecute.shift()
  if (!config) return executeAutomaticBuildingUpgradesOperations({ buildingUpgradesToExecute, executedAt, models, auth, tribalWarsExecutors })
  const id = _id.toString()

  config.auth = auth
  tribalWarsExecutors({ config, emitterKey: id, mode: BUILDING_UPGRADES_MODE })

  return new Promise((resolve) => {
    setOneTimeListener({
      key: id,
      listener: async ({ isError, payload }) => {
        if (!isError && payload) {
          const { queue } = payload
          if (!queue?.length) {
            const nextExecutionAt = moment.utc().add(60, 'minutes').toDate()
            console.log('Queue is empty, next execution set for 60 min')
            await models.BuildingUpgradeConfig.updateOne({ _id }, { $set: { executedAt, nextExecutionAt }, $inc: { executedTimes: 1, failedTimes: 1 } })
          } else {
            const endTimeInMs = queue[queue.length - 1].timeCompleted * 1000 - NEXT_EXECUTION_OFFSET
            const nextExecutionAt = moment.utc(endTimeInMs).toDate()

            await models.BuildingUpgradeConfig.updateOne({ _id }, { $set: { executedAt, nextExecutionAt }, $inc: { executedTimes: 1 } })
          }
        } else {
          const nextExecutionAt = moment.utc().add(60, 'minutes').toDate()
          console.log('Error happened, next execution set for 60 min')
          await models.BuildingUpgradeConfig.updateOne({ _id }, { $set: { executedAt, nextExecutionAt }, $inc: { executedTimes: 1, failedTimes: 1 } })
        }

        await delay(roundRandomWithRange({ min: 1, max: 3 }) * 1000)
        return resolve(executeAutomaticBuildingUpgradesOperations({ buildingUpgradesToExecute, executedAt, models, auth, tribalWarsExecutors }))
      }
    })
  })
}

export default async function executeBuildingUpgradesOperations ({ executedAt, queryExecutionDue, models, auth, tribalWarsExecutors }) {
  const buildingUpgradesToExecute = await models.BuildingUpgradeConfig.find(queryExecutionDue).lean()
  return executeAutomaticBuildingUpgradesOperations({ buildingUpgradesToExecute, executedAt, models, auth, tribalWarsExecutors })
}

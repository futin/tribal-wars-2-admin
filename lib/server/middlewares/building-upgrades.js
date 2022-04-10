// node core modules
import EventEmitter from 'events'

// 3rd party modules
import moment from 'moment-timezone'

// local modules
import { BUILDING_UPGRADES_MODE } from '../../constants'
import { delay } from 'promises-to-retry'
import { roundRandomWithRange } from '../../utils'

// we need this offset so that the scheduler is executed before the
// last upgrade in queue finishes
const NEXT_EXECUTION_OFFSET = 5 * 1000

const buildingUpgradeMiddleware = ({ models, auth, tribalWarsAdmin }) => async (req, res) => {
  const emitter = new EventEmitter()
  const executedAt = moment.utc().toDate()
  const queryExecutionDue = { nextExecutionAt: { $lt: executedAt } }

  const buildingUpgradesToExecute = await models.BuildingUpgradeConfig.find(queryExecutionDue).lean()
  console.log(`Executing scheduled [${buildingUpgradesToExecute.length}] building upgrades`)

  if (buildingUpgradesToExecute.length) {
    for (const { _id, config } of buildingUpgradesToExecute) {
      if (config) {
        tribalWarsAdmin({ config: { ...config, auth }, emitter, mode: BUILDING_UPGRADES_MODE })

        emitter.on('data', async ({ queue }) => {
          if (!queue.length) {
            console.log('Something went wrong, queue should not be empty')
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

  res.end('Done')
}

const attackSchedulerConfig = {
  method: 'get',
  routeName: '/building-upgrades',
  middleware: buildingUpgradeMiddleware
}

export default {
  attackSchedulerConfig
}

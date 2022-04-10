// node core modules
import EventEmitter from 'events'

// 3rd party modules
import { delay } from 'promises-to-retry'
import moment from 'moment-timezone'

// local modules
import { roundRandomWithRange } from '../../utils'
import { RECRUIT_UNITS_MODE, ATTACK_MODE, BUILDING_UPGRADES_MODE } from '../../constants'

// we need this offset so that the scheduler is executed before the
// last upgrade in queue finishes
const NEXT_EXECUTION_OFFSET = 5 * 1000

const schedulerMiddleware = ({ models, auth, tribalWarsAdmin }) => async (req, res) => {
  const emitter = new EventEmitter()
  const executedAt = moment.utc().toDate()
  const queryExecutionDue = { nextExecutionAt: { $lt: executedAt } }
  // execute scheduled recruits
  const recruitsToExecute = await models.RecruitConfig.find(queryExecutionDue).lean()

  console.log(`Executing scheduled [${recruitsToExecute.length}] recruits`)
  if (recruitsToExecute.length) {
    for (const { _id, config, minimumIntervalInMinutes } of recruitsToExecute) {
      if (!config) continue
      tribalWarsAdmin({ config: { ...config, auth }, mode: RECRUIT_UNITS_MODE })
      const nextExecutionAt = moment.utc().add(minimumIntervalInMinutes, 'minutes').toDate()
      await models.RecruitConfig.updateOne({ _id }, { $set: { executedAt, nextExecutionAt }, $inc: { executedTimes: 1 } })
      // delay always some random period
      await delay(roundRandomWithRange({ min: 2, max: 4 }) * 1000)
    }
  }

  const attacksToExecute = await models.AttackConfig.find(queryExecutionDue).lean()
  console.log(`Executing scheduled [${attacksToExecute.length}] attacks`)

  if (attacksToExecute.length) {
    for (const { _id, config, minimumIntervalInMinutes } of attacksToExecute) {
      if (!config) continue
      tribalWarsAdmin({ config: { ...config, auth }, mode: ATTACK_MODE })
      const nextExecutionAt = moment.utc().add(minimumIntervalInMinutes, 'minutes').toDate()
      await models.AttackConfig.updateOne({ _id }, { $set: { executedAt, nextExecutionAt }, $inc: { executedTimes: 1 } })
      await delay(roundRandomWithRange({ min: 1, max: 3 }) * 1000)
    }
  }

  const buildingUpgradesToExecute = await models.BuildingUpgradeConfig.find(queryExecutionDue).lean()
  console.log(`Executing scheduled [${buildingUpgradesToExecute.length}] building upgrades`)

  if (buildingUpgradesToExecute.length) {
    for (const { _id, config } of buildingUpgradesToExecute) {
      if (!config) continue
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

  res.end('Done')
}

const schedulerConfig = {
  method: 'get',
  routeName: '/scheduler',
  middleware: schedulerMiddleware
}

export default {
  schedulerConfig
}

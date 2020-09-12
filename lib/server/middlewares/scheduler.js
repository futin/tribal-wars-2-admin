// node core modules

// 3rd party modules
import { delay } from 'promises-to-retry'
import moment from 'moment-timezone'

// local modules
import { roundRandomWithRange } from '../../utils'
import { RECRUIT_MODE, ATTACK_MODE } from '../../constants'

const schedulerMiddleware = ({ models, auth, tribalWarsAdmin }) => async () => {
  // delay always some random period
  await delay(roundRandomWithRange({ min: 1, max: 5 }) * 1000)
  const executedAt = moment.utc().toDate()
  const queryExecutionDue = { nextExecutionAt: { $lt: executedAt } }
  // execute scheduled recruits
  const recruitsToExecute = await models.RecruitConfig.find(queryExecutionDue).lean()

  if (recruitsToExecute.length) {
    for (const { _id, config, minimumIntervalInMinutes } of recruitsToExecute) {
      if (config) {
        tribalWarsAdmin({ config: { ...config, auth }, mode: RECRUIT_MODE })
        const nextExecutionAt = moment.utc().add(minimumIntervalInMinutes, 'minutes').toDate()
        await models.RecruitConfig.updateOne({ _id }, { $set: { executedAt, nextExecutionAt }, $inc: { executedTimes: 1 } })
      }
    }
  }

  const attacksToExecute = await models.AttackConfig.find(queryExecutionDue).lean()

  if (attacksToExecute.length) {
    for (const { _id, config, minimumIntervalInMinutes } of attacksToExecute) {
      if (config) {
        tribalWarsAdmin({ config: { ...config, auth }, mode: ATTACK_MODE })
        const nextExecutionAt = moment.utc().add(minimumIntervalInMinutes, 'minutes').toDate()
        await models.AttackConfig.updateOne({ _id }, { $set: { executedAt, nextExecutionAt }, $inc: { executedTimes: 1 } })
      }
    }
  }
}

const schedulerConfig = {
  method: 'get',
  routeName: '/scheduler',
  middleware: schedulerMiddleware
}

export default {
  schedulerConfig
}

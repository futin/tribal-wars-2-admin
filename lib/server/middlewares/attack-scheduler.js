// node core modules

// 3rd party modules
import moment from 'moment-timezone'

// local modules
import { ATTACK_SCHEDULER_MODE } from '../../constants'

const attackSchedulerMiddleware = ({ models, auth, tribalWarsAdmin }) => async (req, res) => {
  const now = moment.utc().toDate()
  // execute all actions
  const attacksToExecute = await models.AttackScheduler.find({ executeAt: { $lt: now }, isExecuted: { $ne: true } }).lean()

  console.log(`Executing scheduled [${attacksToExecute.length}] attacks`)
  if (!attacksToExecute.length) return res.end('Done')
  const scheduledAttacks = attacksToExecute.map(({ _id, target, name, x, y, presetConfig }) => ({ _id, target, name, x, y, presetConfig }))
  const scheduledAttackIds = attacksToExecute.map(({ _id }) => _id)
  tribalWarsAdmin({ config: { scheduledAttacks, auth }, mode: ATTACK_SCHEDULER_MODE })

  await models.AttackScheduler.updateMany({ _id: { $in: scheduledAttackIds } }, { $set: { isExecuted: true } }, { multi: true })

  res.end('Done')
}

const attackSchedulerConfig = {
  method: 'get',
  routeName: '/attack-scheduler',
  middleware: attackSchedulerMiddleware
}

export default {
  attackSchedulerConfig
}

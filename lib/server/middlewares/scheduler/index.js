// node core modules

// 3rd party modules
import moment from 'moment-timezone'

// local modules
import executeRecruitOperations from './recruit-scheduler.js'
import executeFarmOperations from './farm-scheduler.js'
import executeBuildingUpgradesOperations from './building-upgrades-scheduler.js'

// we need this offset so that the scheduler is executed before the
// last upgrade in queue finishes

const schedulerMiddleware = ({ models, auth, tribalWarsExecutors }) => async (req, res) => {
  const executedAt = moment.utc().toDate()
  const queryExecutionDue = { nextExecutionAt: { $lt: executedAt }, isInvalid: null }

  await executeRecruitOperations({ executedAt, queryExecutionDue, models, auth, tribalWarsExecutors })
  await executeFarmOperations({ executedAt, queryExecutionDue, models, auth, tribalWarsExecutors })
  await executeBuildingUpgradesOperations({ executedAt, queryExecutionDue, models, auth, tribalWarsExecutors })

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

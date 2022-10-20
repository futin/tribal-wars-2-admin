// node core modules

// 3rd party modules
import moment from 'moment-timezone'

// local modules
import { LINE_SEPARATOR } from '#global-constants'
import executeRecruitOperations from './recruit-scheduler.js'
import executeFarmingOperations from './farming-scheduler.js'
import executeBuildingUpgradesOperations from './building-upgrades-scheduler.js'
import executeRelocationUnitsOperations from './relocation-scheduler.js'
import executeTradingResourcesOperations from './trading-resources.js'
import executeResourceDepositOperations from './resource-deposit.js'

// we need this offset so that the scheduler is executed before the
// last upgrade in queue finishes

const schedulerMiddleware = ({ models, auth, tribalWarsExecutors }) => async (req, res) => {
  // end immediately, without waiting for all the executions
  res.end('Done')

  const executedAt = moment.utc().toDate()
  const queryExecutionDue = { nextExecutionAt: { $lt: executedAt }, isInvalid: null }

  console.log('\nScheduler running', LINE_SEPARATOR)

  await executeResourceDepositOperations({ executedAt, queryExecutionDue, models, auth, tribalWarsExecutors })
  await executeRecruitOperations({ executedAt, queryExecutionDue, models, auth, tribalWarsExecutors })
  await executeBuildingUpgradesOperations({ executedAt, queryExecutionDue, models, auth, tribalWarsExecutors })
  await executeRelocationUnitsOperations({ executedAt, queryExecutionDue, models, auth, tribalWarsExecutors })
  await executeTradingResourcesOperations({ executedAt, queryExecutionDue, models, auth, tribalWarsExecutors })
  await executeFarmingOperations({ executedAt, queryExecutionDue, models, auth, tribalWarsExecutors })
}

const schedulerConfig = {
  method: 'get',
  routeName: '/scheduler',
  middleware: schedulerMiddleware
}

export default schedulerConfig

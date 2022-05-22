// node core modules

// 3rd party modules
import moment from 'moment-timezone'

// local modules
import { TRADING_RESOURCES_MODE } from '#global-constants'
import { setOneTimeListener } from '#custom-emitter'
import { delay } from 'promises-to-retry'
import { roundRandomWithRange } from '#global-utils'

async function executeAutomaticTradingResourcesOperations ({ tradingResourcesToExecute, executedAt, models, auth, tribalWarsExecutors }) {
  console.log(`Scheduled tradingResources left: [${tradingResourcesToExecute.length}]`)

  if (!tradingResourcesToExecute.length) return
  const { _id, config } = tradingResourcesToExecute.shift()
  if (!config) return executeAutomaticTradingResourcesOperations({ tradingResourcesToExecute, executedAt, models, auth, tribalWarsExecutors })
  const id = _id.toString()

  config.auth = auth
  tribalWarsExecutors({ config, emitterKey: id, mode: TRADING_RESOURCES_MODE })

  return new Promise((resolve) => {
    setOneTimeListener({
      key: id,
      listener: async () => {
        const { minRetrialIntervalInMinutes } = config
        const nextExecutionAt = moment.utc().add(minRetrialIntervalInMinutes, 'minutes').toDate()

        await models.TradingResourcesConfig.updateOne({ _id }, { $set: { executedAt, nextExecutionAt }, $inc: { executedTimes: 1 } })

        await delay(roundRandomWithRange({ min: 1, max: 3 }) * 1000)
        return resolve(executeAutomaticTradingResourcesOperations({ tradingResourcesToExecute, executedAt, models, auth, tribalWarsExecutors }))
      }
    })
  })
}

export default async function executeTradingResourcesOperations ({ executedAt, queryExecutionDue, models, auth, tribalWarsExecutors }) {
  const tradingResourcesToExecute = await models.TradingResourcesConfig.find({ ...queryExecutionDue, isInvalid: { $ne: true } }).lean()
  return executeAutomaticTradingResourcesOperations({ tradingResourcesToExecute, executedAt, models, auth, tribalWarsExecutors })
}

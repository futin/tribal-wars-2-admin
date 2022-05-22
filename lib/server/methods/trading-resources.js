// node core modules

// 3rd party modules
import moment from 'moment-timezone'

// local modules
import tribalWarsExecutors from '#tw-executors'
import { TRADING_RESOURCES_MODE } from '#global-constants'

/* GET */

export const getAllTradingResourcesConfigs = ({ models }) => models.TradingResourcesConfig.find()

export const getTradingResourcesConfig = ({ models, id }) => models.TradingResourcesConfig.findById(id)

/* SET */

export const setTradingResourcesConfig = ({ models, config }) => {
  const { minRetrialIntervalInMinutes } = config
  const nextExecutionAt = moment.utc().add(minRetrialIntervalInMinutes, 'minutes').toDate()
  const createdAt = moment.utc().toDate()

  const tradingResourcesConfig = {
    nextExecutionAt,
    createdAt,
    config
  }

  return models.TradingResourcesConfig.create(tradingResourcesConfig)
}

export const activateImmediateTradingResources = ({ config, auth }) => {
  config.auth = auth
  tribalWarsExecutors({ config, mode: TRADING_RESOURCES_MODE })
  return true
}

/* DELETE */

export const deleteTradingResourcesConfig = async ({ models, id }) => {
  const { deletedCount } = await models.TradingResourcesConfig.deleteById(id)
  return !!deletedCount
}

export const deleteAllTradingResourcesConfigs = async ({ models }) => {
  const { deletedCount } = await models.TradingResourcesConfig.deleteMany()
  return !!deletedCount
}

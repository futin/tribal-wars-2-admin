// node core modules

// 3rd party modules
import moment from 'moment-timezone'

// local modules
import tribalWarsExecutors from '#tw-executors'
import { RESOURCE_DEPOSIT_MODE } from '#global-constants'

/* GET */

export const getAllResourceDepositConfigs = ({ models }) => models.ResourceDepositConfig.find()

export const getResourceDepositConfig = ({ models, id }) => models.ResourceDepositConfig.findById(id)

/* SET */

export const setResourceDepositConfig = ({ models, config }) => {
  const { minRetrialIntervalInMinutes } = config
  const nextExecutionAt = moment.utc().add(minRetrialIntervalInMinutes, 'minutes').toDate()
  const createdAt = moment.utc().toDate()

  const resourceDepositConfig = {
    nextExecutionAt,
    createdAt,
    config
  }

  return models.ResourceDepositConfig.create(resourceDepositConfig)
}

export const activateImmediateResourceDeposit = ({ config, auth }) => {
  config.auth = auth
  tribalWarsExecutors({ config, mode: RESOURCE_DEPOSIT_MODE })
  return true
}

/* DELETE */

export const deleteResourceDepositConfig = async ({ models, id }) => {
  const { deletedCount } = await models.ResourceDepositConfig.deleteById(id)
  return !!deletedCount
}

export const deleteAllResourceDepositConfigs = async ({ models }) => {
  const { deletedCount } = await models.ResourceDepositConfig.deleteMany()
  return !!deletedCount
}

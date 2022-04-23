// node core modules

// 3rd party modules
import moment from 'moment-timezone'

// local modules
import tribalWarsExecutors from '#tw-executors'
import { FARMING_MODE } from '#global-constants'

/* GET */

export const getAllFarmingConfigs = ({ models }) => models.FarmingConfig.find()

export const getFarmingConfig = ({ models, id }) => models.FarmingConfig.findById(id)

/* SET */

export const setFarmingConfig = ({ models, config }) => {
  const { minimumRetrialIntervalInMinutes } = config
  const nextExecutionAt = moment.utc().add(minimumRetrialIntervalInMinutes, 'minutes').toDate()
  const createdAt = moment.utc().toDate()

  const farmingConfig = {
    nextExecutionAt,
    createdAt,
    config
  }

  return models.FarmingConfig.create(farmingConfig)
}

export const activateImmediateFarming = ({ config, auth }) => {
  config.auth = auth
  tribalWarsExecutors({ config, mode: FARMING_MODE })
  return true
}

/* DELETE */

export const deleteFarmingConfig = async ({ models, id }) => {
  const { deletedCount } = await models.FarmingConfig.deleteById(id)
  return !!deletedCount
}

export const deleteAllFarmingConfigs = async ({ models }) => {
  const { deletedCount } = await models.FarmingConfig.deleteMany()
  return !!deletedCount
}

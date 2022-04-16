// node core modules

// 3rd party modules
import moment from 'moment-timezone'

// local modules
import tribalWarsExecutors from '#tw-executors'
import { FARMING_MODE } from '#global-constants'

/* GETTERS */
export const getAllFarmingConfigs = ({ models }) => models.FarmingConfig.find()

export const getFarmingConfig = ({ models, id }) => models.FarmingConfig.findById(id)

/* SETTERS */
export const setFarmingConfig = ({ models, minimumIntervalInMinutes, config }) => {
  const nextExecutionAt = moment.utc().add(minimumIntervalInMinutes, 'minutes').toDate()
  const createdAt = moment.utc().toDate()

  const farmingConfig = {
    minimumIntervalInMinutes,
    nextExecutionAt,
    createdAt,
    config
  }

  return models.FarmingConfig.create(farmingConfig)
}

export const deleteFarmingConfig = async ({ models, id }) => {
  const { deletedCount } = await models.FarmingConfig.deleteById(id)
  return !!deletedCount
}

export const deleteAllFarmingConfigs = async ({ models }) => {
  const { deletedCount } = await models.FarmingConfig.deleteMany()
  return !!deletedCount
}

export const activateImmediateFarming = ({ config }) => {
  tribalWarsExecutors({ config, mode: FARMING_MODE })
  return true
}

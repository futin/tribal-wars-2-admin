// node core modules

// 3rd party modules
import moment from 'moment-timezone'

// local modules
import tribalWarsExecutors from '#tw-executors'
import { BUILDING_UPGRADES_MODE } from '#global-constants'

/* GET */

export const getAllBuildingUpgradeConfigs = ({ models }) => models.BuildingUpgradeConfig.find()

export const getBuildingUpgradeConfig = ({ models, id }) => models.BuildingUpgradeConfig.findById(id)

/* SET */

export const setBuildingUpgradeConfig = ({ models, config }) => {
  const createdAt = new Date()
  const nextExecutionAt = createdAt
  const buildingUpgradeConfig = {
    nextExecutionAt,
    createdAt,
    config
  }

  return models.BuildingUpgradeConfig.create(buildingUpgradeConfig)
}

export const activateImmediateBuildingUpgrade = ({ config, auth }) => {
  config.auth = auth
  tribalWarsExecutors({ config, mode: BUILDING_UPGRADES_MODE })
}

/* DELETE */

export const deleteBuildingUpgradeConfig = async ({ models, id }) => {
  const { deletedCount } = await models.BuildingUpgradeConfig.deleteById(id)
  return !!deletedCount
}

export const deleteAllBuildingUpgradeConfigs = async ({ models }) => {
  const { deletedCount } = await models.BuildingUpgradeConfig.deleteMany()
  return !!deletedCount
}

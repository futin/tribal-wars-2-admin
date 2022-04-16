// node core modules

// 3rd party modules
import moment from 'moment-timezone'

// local modules
import tribalWarsExecutors from '@tw-executors'
import { BUILDING_UPGRADES_MODE } from '@global-constants'

/* SETTERS */
export const setBuildingUpgradeConfig = ({ models, nextExecutionInMinutes, config }) => {
  const createdAt = new Date()
  const nextExecutionAt = moment.utc().add(nextExecutionInMinutes, 'minutes').toDate()
  const buildingUpgradeConfig = {
    nextExecutionAt,
    createdAt,
    config
  }

  return models.BuildingUpgradeConfig.create(buildingUpgradeConfig)
}

export const activateImmediateBuildingUpgrade = ({ config }) => {
  tribalWarsExecutors({ config, mode: BUILDING_UPGRADES_MODE })
}

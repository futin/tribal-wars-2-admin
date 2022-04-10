// node core modules

// 3rd party modules
import moment from 'moment-timezone'

// local modules
import tribalWarsAdmin from '../../tw'
import { BUILDING_UPGRADES_MODE } from '../../constants'

/* SETTERS */
const setBuildingUpgradeConfig = ({ models, nextExecutionInMinutes, config }) => {
  const createdAt = new Date()
  const nextExecutionAt = moment.utc().add(nextExecutionInMinutes, 'minutes').toDate()
  const buildingUpgradeConfig = {
    nextExecutionAt,
    createdAt,
    config
  }

  return models.BuildingUpgradeConfig.create(buildingUpgradeConfig)
}

const activateImmediateBuildingUpgrade = ({ config }) => {
  tribalWarsAdmin({ config, mode: BUILDING_UPGRADES_MODE })
}

export {
  setBuildingUpgradeConfig,
  activateImmediateBuildingUpgrade
}

// node core modules

// 3rd party modules
import moment from 'moment-timezone'
import tribalWarsAdmin from '../../tw'
import { BUILD_MODE } from '../../constants'

// local modules

/* SETTERS */
const setBuildingUpgradeConfig = ({ models, config }) => {
  const nextExecutionAt = moment.utc().toDate()
  const createdAt = moment.utc().toDate()

  const buildingUpgradeConfig = {
    nextExecutionAt,
    createdAt,
    config
  }

  return models.BuildingUpgradeConfig.create(buildingUpgradeConfig)
}

const activateImmediateBuildingUpgrade = ({ config }) => {
  tribalWarsAdmin({ config, mode: BUILD_MODE })
}

export {
  setBuildingUpgradeConfig,
  activateImmediateBuildingUpgrade
}

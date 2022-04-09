// node core modules

// 3rd party modules
import moment from 'moment-timezone'
import tribalWarsAdmin from '../../tw'
import { BUILD_MODE } from '../../constants'

// local modules

/* SETTERS */
const setBuildingConfig = ({ models, config }) => {
  const nextExecutionAt = moment.utc().toDate()
  const createdAt = moment.utc().toDate()

  const buildConfig = {
    nextExecutionAt,
    createdAt,
    config
  }

  return models.BuildConfig.create(buildConfig)
}

const activateImmediateBuild = ({ config }) => {
  tribalWarsAdmin({ config, mode: BUILD_MODE })
}

export {
  setBuildingConfig,
  activateImmediateBuild
}

// node core modules

// 3rd party modules
import moment from 'moment-timezone'

// local modules
import tribalWarsExecutors from '#tw-executors'
import { RELOCATE_UNITS_MODE, MOVE_SPECIFIC_UNITS_MODE } from '#global-constants'

/* GET */

export const getAllRelocateUnitsConfigs = ({ models }) => models.MoveUnitsConfig.find()

export const getRelocateUnitsConfig = ({ models, id }) => models.MoveUnitsConfig.findById(id)

/* SET */

export const setRelocateUnitsConfig = ({ models, config }) => {
  const { minRetrialIntervalInMinutes } = config
  const nextExecutionAt = moment.utc().add(minRetrialIntervalInMinutes, 'minutes').toDate()
  const createdAt = moment.utc().toDate()

  const relocateUnitsConfig = {
    nextExecutionAt,
    createdAt,
    config
  }

  return models.MoveUnitsConfig.create(relocateUnitsConfig)
}

export const activateRelocateUnits = ({ config, auth }) => {
  config.auth = auth
  tribalWarsExecutors({ config, mode: RELOCATE_UNITS_MODE })
  return true
}

export const activateMoveSpecificUnits = ({ config, auth }) => {
  config.auth = auth
  console.log({ config, auth })
  tribalWarsExecutors({ config, mode: MOVE_SPECIFIC_UNITS_MODE })
  return true
}

/* DELETE */

export const deleteRelocateUnitsConfig = async ({ models, id }) => {
  const { deletedCount } = await models.MoveUnitsConfig.deleteById(id)
  return !!deletedCount
}

export const deleteAllRelocateUnitsConfigs = async ({ models }) => {
  const { deletedCount } = await models.MoveUnitsConfig.deleteMany()
  return !!deletedCount
}

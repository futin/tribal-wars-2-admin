// node core modules

// 3rd party modules
import moment from 'moment-timezone'

// local modules
import tribalWarsExecutors from '#tw-executors'
import { MOVE_UNITS_MODE, MOVE_SPECIFIC_UNITS_MODE } from '#global-constants'

/* GET */

export const getAllMoveUnitsConfigs = ({ models }) => models.MoveUnitsConfig.find()

export const getMoveUnitsConfig = ({ models, id }) => models.MoveUnitsConfig.findById(id)

/* SET */

export const setMoveUnitsConfig = ({ models, config }) => {
  const { minRetrialIntervalInMinutes } = config
  const nextExecutionAt = moment.utc().add(minRetrialIntervalInMinutes, 'minutes').toDate()
  const createdAt = moment.utc().toDate()

  const moveUnitsConfig = {
    nextExecutionAt,
    createdAt,
    config
  }

  return models.MoveUnitsConfig.create(moveUnitsConfig)
}

export const activateMoveUnits = ({ config, auth }) => {
  config.auth = auth
  tribalWarsExecutors({ config, mode: MOVE_UNITS_MODE })
  return true
}

export const activateMoveSpecificUnits = ({ config, auth }) => {
  config.auth = auth
  console.log({ config, auth })
  tribalWarsExecutors({ config, mode: MOVE_SPECIFIC_UNITS_MODE })
  return true
}

/* DELETE */

export const deleteMoveUnitsConfig = async ({ models, id }) => {
  const { deletedCount } = await models.MoveUnitsConfig.deleteById(id)
  return !!deletedCount
}

export const deleteAllMoveUnitsConfigs = async ({ models }) => {
  const { deletedCount } = await models.MoveUnitsConfig.deleteMany()
  return !!deletedCount
}

// node core modules

// 3rd party modules
import moment from 'moment-timezone'

// local modules
import tribalWarsExecutors from '#tw-executors'
import { ATTACK_MODE } from '#global-constants'

/* GETTERS */
const getAllAttackConfigs = ({ models }) => models.AttackConfig.find()

const getAttackConfig = ({ models, id }) => models.AttackConfig.findById(id)

/* SETTERS */
const setAttackConfig = ({ models, minimumIntervalInMinutes, config }) => {
  const nextExecutionAt = moment.utc().add(minimumIntervalInMinutes, 'minutes').toDate()
  const createdAt = moment.utc().toDate()

  const attackConfig = {
    minimumIntervalInMinutes,
    nextExecutionAt,
    createdAt,
    config
  }

  return models.AttackConfig.create(attackConfig)
}

const deleteAttackConfig = async ({ models, id }) => {
  const { deletedCount } = await models.AttackConfig.deleteById(id)
  return !!deletedCount
}

const deleteAllAttackConfigs = async ({ models }) => {
  const { deletedCount } = await models.AttackConfig.deleteMany()
  return !!deletedCount
}

const activateImmediateAttack = ({ config }) => {
  tribalWarsExecutors({ config, mode: ATTACK_MODE })
  return true
}

export default {
  getAllAttackConfigs,
  getAttackConfig,
  setAttackConfig,
  deleteAttackConfig,
  deleteAllAttackConfigs,
  activateImmediateAttack
}

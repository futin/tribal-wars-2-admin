// node core modules

// 3rd party modules

// local modules
import tribalWarsExecutors from '#tw-executors'
import { RECRUIT_UNITS_MODE, RECRUIT_SPIES_MODE } from '#global-constants'
import moment from 'moment-timezone'

/* GET */
export const getAllRecruitConfigs = ({ models }) => models.RecruitConfig.find()
export const getRecruitConfig = ({ models, id }) => models.RecruitConfig.findById(id)

/* SET */
export const setRecruitConfig = ({ models, config }) => {
  const createdAt = moment.utc().toDate()
  const nextExecutionAt = createdAt

  const recruitConfig = {
    config,
    nextExecutionAt,
    createdAt
  }

  return models.RecruitConfig.create(recruitConfig)
}

export const activateImmediateRecruit = ({ config }) => {
  tribalWarsExecutors({ config, mode: RECRUIT_UNITS_MODE })
  return true
}

export const activateImmediateSpyRecruit = ({ config }) => {
  tribalWarsExecutors({ config, mode: RECRUIT_SPIES_MODE })
  return true
}

/* DELETE */

export const deleteRecruitConfig = async ({ models, id }) => {
  const { deletedCount } = await models.RecruitConfig.deleteById(id)
  return !!deletedCount
}

export const deleteAllRecruitConfigs = async ({ models }) => {
  const { deletedCount } = await models.RecruitConfig.deleteMany()
  return !!deletedCount
}

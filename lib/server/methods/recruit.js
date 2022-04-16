// node core modules

// 3rd party modules

// local modules
import tribalWarsExecutors from '#tw-executors'
import { RECRUIT_UNITS_MODE, RECRUIT_SPIES_MODE } from '#global-constants'
import moment from 'moment-timezone'

/* GET */
const getAllRecruitConfigs = ({ models }) => models.RecruitConfig.find()
const getRecruitConfig = ({ models, id }) => models.RecruitConfig.findById(id)

/* SET */
const setRecruitConfig = ({ models, config }) => {
  const createdAt = moment.utc().toDate()
  const nextExecutionAt = createdAt

  const recruitConfig = {
    config,
    nextExecutionAt,
    createdAt
  }

  return models.RecruitConfig.create(recruitConfig)
}

const activateImmediateRecruit = ({ config }) => {
  tribalWarsExecutors({ config, mode: RECRUIT_UNITS_MODE })
  return true
}

const activateImmediateSpyRecruit = ({ config }) => {
  tribalWarsExecutors({ config, mode: RECRUIT_SPIES_MODE })
  return true
}

/* DELETE */

const deleteRecruitConfig = async ({ models, id }) => {
  const { deletedCount } = await models.RecruitConfig.deleteById(id)
  return !!deletedCount
}

const deleteAllRecruitConfigs = async ({ models }) => {
  const { deletedCount } = await models.RecruitConfig.deleteMany()
  return !!deletedCount
}

export default {
  getAllRecruitConfigs,
  getRecruitConfig,
  setRecruitConfig,
  activateImmediateRecruit,
  activateImmediateSpyRecruit,
  deleteRecruitConfig,
  deleteAllRecruitConfigs
}

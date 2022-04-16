// node core modules

// 3rd party modules

// local modules
import { deleteAllAttackConfigs, deleteAttackConfig } from './attack.js'
import { deleteRecruitConfig, deleteAllRecruitConfigs } from './recruit.js'

/* GET */
const getAllConfigs = async ({ models }) => {
  const attackConfigs = await models.AttackConfig.find({})
  const recruitConfigs = await models.RecruitConfig.find({})

  return {
    attackConfigs,
    recruitConfigs
  }
}

/* DELETE */
const deleteConfig = async ({ models, id }) => {
  const isAttackConfig = await deleteAttackConfig({ models, id })
  if (!isAttackConfig) return deleteRecruitConfig({ models, id })
}

const deleteAllConfigs = async ({ models }) => {
  const deletions = await Promise.all([deleteAllAttackConfigs({ models }), deleteAllRecruitConfigs({ models })])
  return deletions.some(Boolean)
}

export default {
  getAllConfigs,
  deleteConfig,
  deleteAllConfigs
}

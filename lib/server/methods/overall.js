// node core modules

// 3rd party modules

// local modules
import { deleteAllAttackConfigs, deleteAttackConfig } from './attack'
import { deleteRecruitConfig, deleteAllRecruitConfigs } from './recruit'

/* GET */
export const getAllConfigs = async ({ models }) => {
  const attackConfigs = await models.AttackConfig.find({})
  const recruitConfigs = await models.RecruitConfig.find({})

  return {
    attackConfigs,
    recruitConfigs
  }
}

/* DELETE */
export const deleteConfig = async ({ models, id }) => {
  const isAttackConfig = await deleteAttackConfig({ models, id })
  if (!isAttackConfig) return deleteRecruitConfig({ models, id })
}

export const deleteAllConfigs = async ({ models }) => {
  const deletions = await Promise.all([deleteAllAttackConfigs({ models }), deleteAllRecruitConfigs({ models })])
  return deletions.some(Boolean)
}

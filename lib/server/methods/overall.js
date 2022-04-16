// node core modules

// 3rd party modules

// local modules
import { deleteAllFarmingConfigs, deleteFarmingConfig } from './farming.js'
import { deleteRecruitConfig, deleteAllRecruitConfigs } from './recruit.js'

/* GET */
export const getAllConfigs = async ({ models }) => {
  const farmingConfigs = await models.FarmingConfig.find({})
  const recruitConfigs = await models.RecruitConfig.find({})

  return {
    farmingConfigs,
    recruitConfigs
  }
}

/* DELETE */
export const deleteConfig = async ({ models, id }) => {
  const isFarmingConfig = await deleteFarmingConfig({ models, id })
  if (!isFarmingConfig) return deleteRecruitConfig({ models, id })
}

export const deleteAllConfigs = async ({ models }) => {
  const deletions = await Promise.all([deleteAllFarmingConfigs({ models }), deleteAllRecruitConfigs({ models })])
  return deletions.some(Boolean)
}

// node core modules

// 3rd party modules

// local modules
import { deleteAllFarmingConfigs } from './farming.js'
import { deleteAllRecruitConfigs } from './recruit.js'
import { deleteAllBuildingUpgradeConfigs } from './building-upgrades.js'
import { deleteAllAttackSchedulers } from './attack-scheduler.js'

/* GET */
export const getAllConfigs = async ({ models }) => {
  const farmingConfigs = await models.FarmingConfig.find({})
  const recruitConfigs = await models.RecruitConfig.find({})
  const attackSchedulers = await models.AttackScheduler.find({})
  const buildingUpgradeConfigs = await models.BuildingUpgradeConfig.find({})

  return {
    farmingConfigs,
    recruitConfigs,
    attackSchedulers,
    buildingUpgradeConfigs
  }
}

/* DELETE */
export const deleteAllConfigs = async ({ models }) => {
  const deletions = await Promise.all([
    deleteAllFarmingConfigs({ models }),
    deleteAllRecruitConfigs({ models }),
    deleteAllBuildingUpgradeConfigs({ models }),
    deleteAllAttackSchedulers({ models })
  ])
  return deletions.some(Boolean)
}

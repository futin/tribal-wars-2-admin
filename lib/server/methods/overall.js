// node core modules

// 3rd party modules

// local modules
import { deleteAllAttackConfigs, deleteAttackConfig } from './attack'
import { deleteRecruitConfig, deleteAllRecruitConfigs } from './recruit'

/* GET */
const getAllConfigs = ({ inMemoryStorage }) => inMemoryStorage

/* DELETE */
const deleteConfig = ({ inMemoryStorage, id }) =>
  deleteAttackConfig({ inMemoryStorage, id }) || deleteRecruitConfig({ inMemoryStorage, id })

const deleteAllConfigs = ({ inMemoryStorage }) => {
  deleteAllAttackConfigs({ inMemoryStorage })
  deleteAllRecruitConfigs({ inMemoryStorage })
  return true
}

export {
  // GET
  getAllConfigs,
  // DELETE
  deleteConfig,
  deleteAllConfigs
}

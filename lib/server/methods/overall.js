// node core modules

// 3rd party modules

// local modules
import { deleteAttackConfig } from './attack'
import { deleteRecruitConfig } from './recruit'

/* GETTERS */
const getAllConfigs = ({ inMemoryStorage }) => inMemoryStorage

/* SETTERS */
const deleteConfig = ({ inMemoryStorage, id }) =>
  deleteAttackConfig({ inMemoryStorage, id }) || deleteRecruitConfig({ inMemoryStorage, id })

export {
  // GETTERS
  getAllConfigs,
  // SETTERS
  deleteConfig
}

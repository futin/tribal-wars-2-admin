// node core modules

// 3rd party modules
import { v4 } from 'uuid'

// local modules
import { setRandomInterval } from '../../utils'
import tribalWarsAdmin from '../../'
import { RECRUIT_MODE } from '../../constants'

/* GETTERS */
const getAllRecruitConfigs = ({ inMemoryStorage }) => inMemoryStorage.recruitConfigs
const getRecruitConfig = ({ inMemoryStorage, id }) => inMemoryStorage.recruitConfigs.find(config => config.id === id)

/* SETTERS */
const setRecruitConfig = ({ inMemoryStorage, minimumIntervalInMinutes, config }) => {
  const minutes = minimumIntervalInMinutes * 60
  const id = v4()

  const intervalExecutions = setRandomInterval(() => {
    // tribalWarsAdmin({ config, mode: RECRUIT_MODE })
    console.log(RECRUIT_MODE)
  }, { min: minutes, max: minutes * 2 })

  const recruitConfig = {
    id,
    minimumIntervalInMinutes,
    ...config,
    ...intervalExecutions
  }

  inMemoryStorage.recruitConfigs.push(recruitConfig)
  return recruitConfig
}

const deleteRecruitConfig = ({ inMemoryStorage, id }) => {
  const index = inMemoryStorage.recruitConfigs.findIndex(config => config.id === id)
  const [recruitConfig] = index !== -1 ? inMemoryStorage.recruitConfigs.splice(index, 1) : []
  if (!recruitConfig) return

  const { clearRandomInterval } = recruitConfig
  clearRandomInterval()

  return true
}

const activateImmediateRecruit = ({ config }) => {
  // tribalWarsAdmin({ config, mode: RECRUIT_MODE })
  console.log(RECRUIT_MODE)
  return true
}

export default {
  // GETTERS
  getAllRecruitConfigs,
  getRecruitConfig,
  // SETTERS
  setRecruitConfig,
  deleteRecruitConfig,
  activateImmediateRecruit
}

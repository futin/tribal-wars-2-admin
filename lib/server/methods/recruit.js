// node core modules

// 3rd party modules
import { v4 } from 'uuid'

// local modules
import { setRandomInterval } from '../../utils'
import tribalWarsAdmin from '../../tw'
import { RECRUIT_MODE } from '../../constants'

/* GET */
const getAllRecruitConfigs = ({ inMemoryStorage }) => inMemoryStorage.recruitConfigs
const getRecruitConfig = ({ inMemoryStorage, id }) => inMemoryStorage.recruitConfigs.find(config => config.id === id)

/* SET */
const setRecruitConfig = ({ inMemoryStorage, minimumIntervalInMinutes, config }) => {
  const minutes = minimumIntervalInMinutes * 60
  const id = v4()

  const intervalExecutions = setRandomInterval(() => {
    tribalWarsAdmin({ config, mode: RECRUIT_MODE })
    // console.log(RECRUIT_MODE)
  }, { min: minutes, max: minutes + 10 })

  const recruitConfig = {
    id,
    minimumIntervalInMinutes,
    ...config,
    ...intervalExecutions
  }

  inMemoryStorage.recruitConfigs.push(recruitConfig)
  return recruitConfig
}

const activateImmediateRecruit = ({ config }) => {
  tribalWarsAdmin({ config, mode: RECRUIT_MODE })
  // console.log(RECRUIT_MODE)
  return true
}

/* DELETE */

const deleteRecruitConfig = ({ inMemoryStorage, id }) => {
  const index = inMemoryStorage.recruitConfigs.findIndex(config => config.id === id)
  const [recruitConfig] = index !== -1 ? inMemoryStorage.recruitConfigs.splice(index, 1) : []
  if (!recruitConfig) return

  const { clearRandomInterval } = recruitConfig
  clearRandomInterval()

  return true
}

const deleteAllRecruitConfigs = ({ inMemoryStorage }) => {
  if (!inMemoryStorage.recruitConfigs.length) return
  inMemoryStorage.recruitConfigs.slice().forEach(({ id }) => deleteRecruitConfig({ inMemoryStorage, id }))
  return true
}

export {
  // GET
  getAllRecruitConfigs,
  getRecruitConfig,
  // SET
  setRecruitConfig,
  activateImmediateRecruit,
  // DELETE
  deleteRecruitConfig,
  deleteAllRecruitConfigs
}

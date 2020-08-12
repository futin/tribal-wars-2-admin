// node core modules

// 3rd party modules
import { v4 } from 'uuid'

// local modules
import { setRandomInterval } from '../../utils'
import tribalWarsAdmin from '../../'
import { ATTACK_MODE } from '../../constants'

/* GETTERS */
const getAllAttackConfigs = ({ inMemoryStorage }) => inMemoryStorage.attackConfigs
const getAttackConfig = ({ inMemoryStorage, id }) => inMemoryStorage.attackConfigs.find(config => config.id === id)

/* SETTERS */
const setAttackConfig = ({ inMemoryStorage, minimumIntervalInMinutes, config }) => {
  const minutes = minimumIntervalInMinutes * 60
  const id = v4()

  const intervalExecutions = setRandomInterval(() => {
    tribalWarsAdmin({ config, mode: ATTACK_MODE })
    // console.log(ATTACK_MODE)
  }, { min: minutes, max: minutes * 2 })

  const attackConfig = {
    id,
    minimumIntervalInMinutes,
    ...config,
    ...intervalExecutions
  }

  inMemoryStorage.attackConfigs.push(attackConfig)
  return attackConfig
}

const deleteAttackConfig = ({ inMemoryStorage, id }) => {
  const index = inMemoryStorage.attackConfigs.findIndex(config => config.id === id)
  const [attackConfig] = index !== -1 ? inMemoryStorage.attackConfigs.splice(index, 1) : []
  if (!attackConfig) return

  const { clearRandomInterval } = attackConfig
  clearRandomInterval()

  return true
}

const deleteAllAttackConfigs = ({ inMemoryStorage }) => {
  if (!inMemoryStorage.attackConfigs.length) return
  inMemoryStorage.attackConfigs.forEach(({ id }) => deleteAttackConfig({ inMemoryStorage, id }))
  return true
}

const activateImmediateAttack = ({ config }) => {
  tribalWarsAdmin({ config, mode: ATTACK_MODE })
  // console.log(ATTACK_MODE)
  return true
}

export {
  // GET
  getAllAttackConfigs,
  getAttackConfig,
  // SET
  setAttackConfig,
  activateImmediateAttack,
  // DELETE
  deleteAttackConfig,
  deleteAllAttackConfigs

}

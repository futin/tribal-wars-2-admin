// node core modules

// 3rd party modules
import { v4 } from 'uuid'

// local modules
import { roundRandomWithRange } from '../../../utils'

const { AUTH_NAME, AUTH_TOKEN, WORLD_NAME } = process.env

const auth = {
  name: AUTH_NAME,
  token: AUTH_TOKEN,
  worldName: WORLD_NAME
}

export default {
  Query: {
    getAllAttackConfigs: (__, ___, { inMemoryStorage }) => inMemoryStorage.attackConfigs,
    getAttackConfig: (__, { id }, { inMemoryStorage }) => inMemoryStorage.attackConfigs.find(config => config.id === id)
  },
  Mutation: {
    setAttackConfig: (__, { attackConfig: { minimumIntervalInMinutes, ...restAttackConfig } }, { inMemoryStorage, tribalWarsAdmin }) => {
      const minutes = minimumIntervalInMinutes * 60
      const id = v4()
      const config = {
        auth,
        attack: {
          ...restAttackConfig
        }
      }
      const interval = setInterval(() => {
        tribalWarsAdmin({ config, mode: 'attack' })
      }, roundRandomWithRange({ min: minutes, randomize: minutes }) * 1000)

      const attackConfig = {
        id,
        config,
        minimumIntervalInMinutes,
        interval
      }

      inMemoryStorage.attackConfigs.push(attackConfig)
      return attackConfig
    },
    deleteAttackConfig: (__, { id }, { inMemoryStorage }) => {
      const index = inMemoryStorage.attackConfigs.findIndex(config => config.id === id)
      const [attackConfig] = index !== -1 ? inMemoryStorage.attackConfigs.splice(index, 1) : []
      if (!attackConfig) return

      const { interval } = attackConfig
      clearInterval(interval)

      return attackConfig
    }
  }
}

// node core modules

// 3rd party modules
import { v4 } from 'uuid'

// local modules
import { setRandomInterval } from '../../../../utils'

export default {
  Query: {
    getAllAttackConfigs: (__, ___, { inMemoryStorage }) => inMemoryStorage.attackConfigs,
    getAttackConfig: (__, { id }, { inMemoryStorage }) => inMemoryStorage.attackConfigs.find(config => config.id === id)
  },
  Mutation: {
    setAttackConfig: (__, { attackConfig: { minimumIntervalInMinutes, ...restAttackConfig } }, { inMemoryStorage, tribalWarsAdmin, auth }) => {
      const minutes = minimumIntervalInMinutes * 60
      const id = v4()
      const config = {
        auth,
        attack: {
          ...restAttackConfig
        }
      }

      const intervalExecutions = setRandomInterval(() => {
        tribalWarsAdmin({ config, mode: 'attack' })
        // console.log('attack!')
      }, { min: minutes, max: minutes * 2 })

      const attackConfig = {
        id,
        config,
        minimumIntervalInMinutes,
        ...intervalExecutions
      }

      inMemoryStorage.attackConfigs.push(attackConfig)
      return attackConfig
    },
    deleteAttackConfig: (__, { id }, { inMemoryStorage }) => {
      const index = inMemoryStorage.attackConfigs.findIndex(config => config.id === id)
      const [attackConfig] = index !== -1 ? inMemoryStorage.attackConfigs.splice(index, 1) : []
      if (!attackConfig) return

      const { clearRandomInterval } = attackConfig
      clearRandomInterval()

      return attackConfig
    }
  }
}

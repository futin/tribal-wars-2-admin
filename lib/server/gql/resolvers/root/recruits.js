// node core modules

// 3rd party modules
import { v4 } from 'uuid'

// local modules
import { setRandomInterval } from '../../../../utils'

export default {
  Query: {
    getAllRecruitConfigs: (__, ___, { inMemoryStorage }) => inMemoryStorage.recruitConfigs,
    getRecruitConfig: (__, { id }, { inMemoryStorage }) => inMemoryStorage.recruitConfigs.find(config => config.id === id)
  },
  Mutation: {
    setRecruitConfig: (__, { recruitConfig: { minimumIntervalInMinutes, ...restRecruitConfig } }, { inMemoryStorage, tribalWarsAdmin, auth }) => {
      const minutes = minimumIntervalInMinutes * 60
      const id = v4()
      const config = {
        auth,
        recruit: {
          ...restRecruitConfig
        }
      }
      const intervalExecutions = setRandomInterval(() => {
        tribalWarsAdmin({ config, mode: 'recruit' })
        // console.log('recruint')
      }, { min: minutes, max: minutes * 2 })

      const recruitConfig = {
        id,
        config,
        minimumIntervalInMinutes,
        ...intervalExecutions
      }

      inMemoryStorage.recruitConfigs.push(recruitConfig)
      return recruitConfig
    },
    deleteRecruitConfig: (__, { id }, { inMemoryStorage }) => {
      const index = inMemoryStorage.recruitConfigs.findIndex(config => config.id === id)
      const [recruitConfig] = index !== -1 ? inMemoryStorage.recruitConfigs.splice(index, 1) : []
      if (!recruitConfig) return

      const { clearRandomInterval } = recruitConfig
      clearRandomInterval()

      return recruitConfig
    }
  }
}

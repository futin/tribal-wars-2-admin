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
    getAllRecruitConfigs: (__, ___, { inMemoryStorage }) => inMemoryStorage.recruitConfigs,
    getRecruitConfig: (__, { id }, { inMemoryStorage }) => inMemoryStorage.recruitConfigs.find(config => config.id === id)
  },
  Mutation: {
    setRecruitConfig: (__, { recruitConfig: { minimumIntervalInMinutes, ...restRecruitConfig } }, { inMemoryStorage, tribalWarsAdmin }) => {
      const minutes = minimumIntervalInMinutes * 60
      const id = v4()
      const config = {
        auth,
        recruit: {
          ...restRecruitConfig
        }
      }
      const interval = setInterval(() => {
        tribalWarsAdmin({ config, mode: 'recruit' })
      }, roundRandomWithRange({ min: minutes, randomize: minutes }) * 1000)

      const recruitConfig = {
        id,
        config,
        minimumIntervalInMinutes,
        interval
      }

      inMemoryStorage.recruitConfigs.push(recruitConfig)
      return recruitConfig
    },
    deleteRecruitConfig: (__, { id }, { inMemoryStorage }) => {
      const index = inMemoryStorage.recruitConfigs.findIndex(config => config.id === id)
      const [recruitConfig] = index !== -1 ? inMemoryStorage.recruitConfigs.splice(index, 1) : []
      if (!recruitConfig) return

      const { interval } = recruitConfig
      clearInterval(interval)

      return recruitConfig
    }
  }
}

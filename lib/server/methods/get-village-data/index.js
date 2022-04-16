// node core modules

// 3rd party modules

// local modules
import tribalWarsExecutors from '#tw-executors'
import { VILLAGES_DATA_MODE } from '#global-constants'
import { ing, toMongoId } from '#global-utils'
import { setOneTimeListener } from '#custom-emitter'
import { initGoogleDoc, transformVillageData } from '../utils.js'
import { setupOffenseSheet, setupDefenseSheet, setupTotalSheet, setupResourceSheet } from './sheet-handler.js'

/* GET */
const getVillageData = async ({ auth, googleDocAuth, googleDocId }) => {
  const id = toMongoId()
  tribalWarsExecutors({ config: { auth }, mode: VILLAGES_DATA_MODE, emitterKey: id })

  return new Promise((resolve) => {
    setOneTimeListener({
      key: id,
      listener: async ({ isError, message, payload }) => {
        if (isError || !payload) {
          console.log({ isError, payload })
          console.log('getVillageData():', message)
          return resolve(null)
        }

        const units = transformVillageData(payload.units)
        const resources = transformVillageData(payload.resources)
        units.push({ VillageName: 'Average' })
        resources.push({ VillageName: 'Average' })

        if (googleDocId) {
          const [err, googleDoc] = await ing(initGoogleDoc({ googleDocAuth, googleDocId }))
          if (err) {
            console.error('Error occurred while loading google document', err)
            return resolve(err)
          }

          setupOffenseSheet({ googleDoc, units })
          setupDefenseSheet({ googleDoc, units })
          setupTotalSheet({ googleDoc, units })
          setupResourceSheet({ googleDoc, resources })
        }

        return resolve({ units, resources })
      }
    })
  })
}

export default {
  getVillageData
}

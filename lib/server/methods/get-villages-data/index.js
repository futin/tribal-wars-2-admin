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
export const getVillagesData = async ({ auth, googleDocAuth, googleDocId }) => {
  const id = toMongoId()
  tribalWarsExecutors({ config: { auth }, mode: VILLAGES_DATA_MODE, emitterKey: id })

  return new Promise((resolve) => {
    setOneTimeListener({
      key: id,
      listener: async ({ isError, message, payload }) => {
        if (isError || !payload) {
          console.log('getVillagesData():', message)
          return resolve(null)
        }

        const units = transformVillageData(payload.units)
        const resources = transformVillageData(payload.resources)

        if (googleDocId) {
          const [err, googleDoc] = await ing(initGoogleDoc({ googleDocAuth, googleDocId }))
          if (err) {
            console.error('Error occurred while loading google document', err)
            return resolve(err)
          }

          const unitsWithAverage = units.concat({ VillageName: 'Average' })
          const resourcesWithAverage = resources.concat({ VillageName: 'Average' })
          Promise.all([
            setupOffenseSheet({ googleDoc, units: unitsWithAverage }),
            setupDefenseSheet({ googleDoc, units: unitsWithAverage }),
            setupTotalSheet({ googleDoc, units: unitsWithAverage }),
            setupResourceSheet({ googleDoc, resources: resourcesWithAverage })
          ])
        }

        return resolve({ units, resources })
      }
    })
  })
}

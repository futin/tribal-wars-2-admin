// node core modules
import EventEmitter from 'events'

// 3rd party modules

// local modules
import tribalWarsExecutors from '@tw-executors'
import { VILLAGES_DATA_MODE } from '@global-constants'
import { initGoogleDoc, transformVillageData } from '../utils'
import { ing } from '@global-utils'
import { setupOffenseSheet, setupDefenseSheet, setupTotalSheet, setupResourceSheet } from './sheet-handler'

/* GET */
const getVillageData = async ({ auth, googleDocAuth, googleDocId }) => {
  const emitter = new EventEmitter()
  tribalWarsExecutors({ config: { auth }, mode: VILLAGES_DATA_MODE, emitter })

  return new Promise((resolve) => {
    emitter.once('close', () => resolve())
    emitter.once('data', async data => {
      const units = transformVillageData(data.units)
      const resources = transformVillageData(data.resources)
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
    })
  })
}

export {
  // GET
  getVillageData
}

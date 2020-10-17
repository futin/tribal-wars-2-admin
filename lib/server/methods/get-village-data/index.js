// node core modules
import EventEmitter from 'events'

// 3rd party modules

// local modules
import tribalWarsAdmin from '../../../tw'
import { VILLAGES_DATA_MODE } from '../../../constants'
import { initGoogleDoc, transformVillagesData } from '../utils'
import { ing } from '../../../utils'
import { setupOffenseSheet, setupDefenseSheet, setupTotalSheet } from './sheet-handler'

/* GET */
const getUnitsCount = async ({ auth, googleDocAuth, googleDocId }) => {
  const emitter = new EventEmitter()
  tribalWarsAdmin({ config: { auth }, mode: VILLAGES_DATA_MODE, emitter })

  return new Promise((resolve) => {
    emitter.on('close', () => resolve())
    emitter.on('data', async data => {
      const allData = transformVillagesData(data)
      allData.push({ VillageName: 'Average' })

      if (googleDocId) {
        const [err, googleDoc] = await ing(initGoogleDoc({ googleDocAuth, googleDocId }))
        if (err) {
          console.error('Error occurred while loading google document', err)
          return resolve(err)
        }

        await setupOffenseSheet({ googleDoc, allData })
        await setupDefenseSheet({ googleDoc, allData })
        await setupTotalSheet({ googleDoc, allData })
      }

      return resolve(allData)
    })
  })

  // const allData = troopsMock
  // allData.push({ VillageName: 'Average' })
  // if (googleDocId) {
  //   const [err, googleDoc] = await ing(initGoogleDoc({ googleDocAuth, googleDocId }))
  //   if (err) {
  //     console.error('Error occurred while loading google document')
  //     return
  //   }
  //
  //   await setupOffenseSheet({ googleDoc, allData })
  //   await setupDefenseSheet({ googleDoc, allData })
  //   await setupTotalSheet({ googleDoc, allData })
  // }
  //
  // return allData
}

export {
  // GET
  getUnitsCount
}

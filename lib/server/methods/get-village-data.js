// node core modules
import EventEmitter from 'events'

// 3rd party modules

// local modules
import tribalWarsAdmin from '../../tw'
import { VILLAGES_DATA_MODE } from '../../constants'
import { initGoogleDoc, setupSheet, transformVillagesData } from './utils'

const SHEET_TITLE = 'villages-count'

/* GET */
const getUnitsCount = ({ auth, googleDocAuth, googleDocId }) => {
  const emitter = new EventEmitter()
  tribalWarsAdmin({ config: { auth }, mode: VILLAGES_DATA_MODE, emitter })

  return new Promise((resolve) => {
    emitter.on('close', () => resolve())
    emitter.on('data', async data => {
      const transformedData = transformVillagesData(data)

      if (googleDocId) {
        const googleDoc = await initGoogleDoc({ googleDocAuth, googleDocId })
        const sheet = await setupSheet({ googleDoc, title: SHEET_TITLE, headerValues: Object.keys(transformedData[0]) })
        await sheet.addRows(transformedData)
      }

      return resolve(transformedData)
    })
  })
}

export {
  // GET
  getUnitsCount
}

// node core modules
import EventEmitter from 'events'

// 3rd party modules
import { GoogleSpreadsheet } from 'google-spreadsheet'

// local modules
import tribalWarsAdmin from '../../tw'
import { VILLAGES_DATA_MODE } from '../../constants'

const { GOOGLE_API_KEY } = process.env

/* GET */
const getUnitsCount = ({ auth, googleSheetDocId }) => {
  const emitter = new EventEmitter()
  tribalWarsAdmin({ config: { auth }, mode: VILLAGES_DATA_MODE, emitter })

  return new Promise((resolve) => {
    emitter.on('close', () => resolve())
    emitter.on('data', async data => {
      if (googleSheetDocId) {
        const googleDoc = new GoogleSpreadsheet(googleSheetDocId)
        console.log({
          googleSheetDocId,
          googleDoc
        })
        if (googleDoc) {
          await googleDoc.useApiKey(GOOGLE_API_KEY)
          await googleDoc.loadInfo()
          console.log(googleDoc.title)
        }
      }
      return resolve(data)
    })
  })
}

export {
  // GET
  getUnitsCount
}

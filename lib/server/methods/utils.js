// node core modules

// 3rd party modules
import moment from 'moment'
import _ from 'lodash'
import { GoogleSpreadsheet } from 'google-spreadsheet'

// local modules
import { DATE_FORMAT, DEFAULT_TIMEZONE } from '../../constants'

export const transformAttackScheduler = attackScheduler => {
  const { arrivalDate, targets, timezone = DEFAULT_TIMEZONE } = attackScheduler
  attackScheduler.arrivalDate = moment.utc(arrivalDate, DATE_FORMAT).tz(timezone).format(DATE_FORMAT)
  attackScheduler.targets = targets.map(target => ({ ...target, launchTime: moment.utc(target.launchTime, DATE_FORMAT).tz(timezone).format(DATE_FORMAT) }))
  return attackScheduler
}

export const initGoogleDoc = async ({ googleDocAuth, googleDocId }) => {
  const googleDoc = new GoogleSpreadsheet(googleDocId)
  await googleDoc.useServiceAccountAuth({
    client_email: googleDocAuth.client_email,
    private_key: googleDocAuth.private_key
  })
  await googleDoc.loadInfo()
  return googleDoc
}

export const setupSheet = async ({ googleDoc, title, headerValues }) => {
  let sheet = googleDoc.sheetsByTitle[title]
  if (!sheet) sheet = await googleDoc.addSheet({ title })
  await sheet.clear()
  await sheet.setHeaderRow(headerValues)

  return sheet
}

const sortVillages = ({ VillageName: village1 }, { VillageName: village2 }) => {
  const village1No = village1.match(/[0-9]+/)
  const village2No = village2.match(/[0-9]+/)
  if (!village1No || !village2No) return -1
  return parseInt(village1No, 10) - parseInt(village2No, 10)
}

export const transformVillagesData = data => _.reduce(data, (result, data, VillageName) => result.concat({ VillageName, ...data }), []).sort(sortVillages)

export const getCells = ({ sheet, raw, coll }) => {
  const cells = []
  let { from: collFrom } = coll
  while (raw.from <= raw.to) {
    collFrom = coll.from

    while (collFrom <= coll.to) {
      cells.push(sheet.getCell(raw.from, collFrom))
      collFrom += 1
    }

    raw.from += 1
  }

  return cells
}

export const buildAverageFormula = ({ char, min = 2, max }) => `=ROUNDUP(AVERAGE(${char}${min}:${char}${max}))`

export const buildAverageCell = async ({ sheet, allData, headerValues }) => {
  await sheet.loadCells()

  const raw = {
    from: allData.length,
    to: allData.length
  }

  const coll = {
    from: 1,
    to: headerValues.length - 1
  }

  const cells = getCells({ sheet, raw, coll })
  cells.forEach((cell, index) => {
    const char = String.fromCharCode(index + 66)
    cell.formula = buildAverageFormula({ char, max: allData.length - 1 })
  })

  await sheet.saveUpdatedCells()
}

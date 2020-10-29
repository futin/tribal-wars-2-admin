// node core modules

// 3rd party modules
import moment from 'moment'
import _ from 'lodash'
import { GoogleSpreadsheet } from 'google-spreadsheet'

// local modules
import { DATE_FORMAT, DEFAULT_TIMEZONE, BACKGROUND_CELL_COLORS } from '../../constants'

export const transformAttackScheduler = attackScheduler => {
  const { arrivalDate, targets, timezone = DEFAULT_TIMEZONE } = attackScheduler
  attackScheduler.arrivalDate = moment.utc(arrivalDate, DATE_FORMAT).tz(timezone).format(DATE_FORMAT)
  attackScheduler.targets = targets
    .map(target => ({ ...target, launchTime: moment.utc(target.launchTime, DATE_FORMAT).tz(timezone).format(DATE_FORMAT) }))
    .sort(({ launchTime: lt1 }, { launchTime: lt2 }) =>
      moment(lt1, DATE_FORMAT).isAfter(moment(lt2, DATE_FORMAT)) ? 1 : -1)

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

export const transformVillageData = data =>
  _.reduce(data, (result, data, VillageName) =>
    result.concat({ VillageName, ...data }), []).sort(sortVillages)

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

export const buildAverageCell = async ({ sheet, data, headerValues }) => {
  await sheet.loadCells()

  const raw = {
    from: data.length,
    to: data.length
  }

  const coll = {
    from: 1,
    to: headerValues.length - 1
  }

  const cells = getCells({ sheet, raw, coll })
  cells.forEach((cell, index) => {
    const char = String.fromCharCode(index + 66)
    cell.formula = buildAverageFormula({ char, max: data.length - 1 })
  })

  await sheet.saveUpdatedCells()
}

export const addColorToCellRelatedToAverage = async ({ sheet, data, headerValues }) => {
  await sheet.loadCells()

  const collMax = headerValues.length - 1
  const rawMax = data.length - 2
  const averageCellNo = data.length + 1

  const raw = {
    from: 1,
    to: rawMax
  }

  const coll = {
    from: 1,
    to: collMax
  }

  const cells = getCells({ sheet, raw, coll })
  cells.forEach((cell, index) => {
    const char = String.fromCharCode((index % (collMax)) + 66)
    const averageCell = sheet.getCellByA1(`${char}${averageCellNo}`)

    const difference = cell.value / averageCell.value

    if (difference >= 1) cell.textFormat = { foregroundColor: BACKGROUND_CELL_COLORS.GREEN }
    if (difference > 0.5 && difference < 1) cell.textFormat = { foregroundColor: BACKGROUND_CELL_COLORS.YELLOW }
    if (difference <= 0.5) cell.textFormat = { foregroundColor: BACKGROUND_CELL_COLORS.RED }
  })

  await sheet.saveUpdatedCells()
}

export const addColorToCellRelatedToStorage = async ({ sheet, data, headerValues }) => {
  await sheet.loadCells()
  const collMax = headerValues.length - 3
  const rawMax = data.length - 2

  const raw = {
    from: 1,
    to: rawMax
  }

  const coll = {
    from: 1,
    to: collMax
  }

  const cells = getCells({ sheet, raw, coll })
  const char = String.fromCharCode(collMax + 66)

  cells.forEach((cell, index) => {
    const collDynamic = Math.floor(index / collMax) + 2
    const storageCell = sheet.getCellByA1(`${char}${collDynamic}`)

    const difference = cell.value / storageCell.value

    if (difference <= 0.6) cell.textFormat = { foregroundColor: BACKGROUND_CELL_COLORS.GREEN }
    if (difference > 0.6 && difference <= 0.9) cell.textFormat = { foregroundColor: BACKGROUND_CELL_COLORS.YELLOW }
    if (difference > 0.9 && difference <= 1) cell.textFormat = { foregroundColor: BACKGROUND_CELL_COLORS.RED }
  })

  await sheet.saveUpdatedCells()
}

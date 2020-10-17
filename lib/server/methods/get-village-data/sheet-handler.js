// node core modules

// 3rd party modules

// local modules
import { setupSheet, buildAverageCell } from '../utils'
import {
  DEFENSE_TROOPS,
  DEFENSE_SHEET_TITLE,
  OFFENSE_TROOPS,
  OFFENSE_SHEET_TITLE,
  OTHER_TROOPS,
  TOTAL_SHEET_TITLE
} from './constants'

export const setupDefenseSheet = async ({ googleDoc, allData }) => {
  const headerValues = ['VillageName', ...DEFENSE_TROOPS]
  const sheet = await setupSheet({ googleDoc, title: DEFENSE_SHEET_TITLE, headerValues })

  await sheet.addRows(allData)
  await buildAverageCell({ sheet, headerValues, allData })
}

export const setupOffenseSheet = async ({ googleDoc, allData }) => {
  const headerValues = ['VillageName', ...OFFENSE_TROOPS]
  const sheet = await setupSheet({ googleDoc, title: OFFENSE_SHEET_TITLE, headerValues })

  await sheet.addRows(allData)
  await buildAverageCell({ sheet, headerValues, allData })
}

export const setupTotalSheet = async ({ googleDoc, allData }) => {
  const headerValues = ['VillageName', ...OFFENSE_TROOPS, ...DEFENSE_TROOPS, ...OTHER_TROOPS]
  const sheet = await setupSheet({ googleDoc, title: TOTAL_SHEET_TITLE, headerValues })

  await sheet.addRows(allData)
  await buildAverageCell({ sheet, headerValues, allData })
}

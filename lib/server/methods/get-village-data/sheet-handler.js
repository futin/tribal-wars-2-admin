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
  TOTAL_SHEET_TITLE,
  RESOURCES_TITLE,
  RESOURCES
} from './constants'

export const setupDefenseSheet = async ({ googleDoc, units }) => {
  const headerValues = ['VillageName', ...DEFENSE_TROOPS]
  const sheet = await setupSheet({ googleDoc, title: DEFENSE_SHEET_TITLE, headerValues })

  await sheet.addRows(units)
  await buildAverageCell({ sheet, headerValues, data: units })
}

export const setupOffenseSheet = async ({ googleDoc, units }) => {
  const headerValues = ['VillageName', ...OFFENSE_TROOPS]
  const sheet = await setupSheet({ googleDoc, title: OFFENSE_SHEET_TITLE, headerValues })

  await sheet.addRows(units)
  await buildAverageCell({ sheet, headerValues, data: units })
}

export const setupTotalSheet = async ({ googleDoc, units }) => {
  const headerValues = ['VillageName', ...OFFENSE_TROOPS, ...DEFENSE_TROOPS, ...OTHER_TROOPS]
  const sheet = await setupSheet({ googleDoc, title: TOTAL_SHEET_TITLE, headerValues })

  await sheet.addRows(units)
  await buildAverageCell({ sheet, headerValues, data: units })
}

export const setupResourceSheet = async ({ googleDoc, resources }) => {
  const headerValues = ['VillageName', ...RESOURCES]
  const sheet = await setupSheet({ googleDoc, title: RESOURCES_TITLE, headerValues })

  await sheet.addRows(resources)
  await buildAverageCell({ sheet, headerValues, data: resources })
}

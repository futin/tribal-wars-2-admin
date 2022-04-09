// node core modules

// 3rd party modules
import _ from 'lodash'

// local modules
import {
  AUTH_LOGIN_TYPE_SEND,
  AUTH_SELECT_CHARACTER_TYPE_SEND,
  MAP_VILLAGES_BY_AREA_TYPE_SEND,
  MAP_VILLAGES_DETAILS_TYPE_SEND,
  CHARACTER_INFO_TYPE_SEND,
  ARMY_PRESETS_GET_FOR_VILLAGE_TYPE_SEND,
  COMMAND_SEND_PRESET_TYPE_SEND,
  COMMAND_SEND_CUSTOM_ARMY_TYPE_SEND,
  ICON_GET_VILLAGES_TYPE_SEND,
  BARRACKS_RECRUIT_TYPE_SEND,
  HOO_RECRUIT_TYPE_SEND,
  VILLAGES_DATA_TYPE_SEND,
  SCOUTING_RECRUIT_TYPE_SEND,
  GROUPS_TYPE_SEND,
  MASS_DONATION_SEND,
  GAME_DATA_SEND
} from '../constants'
import { buildMessage } from '../utils'

const senders = ({ ws }) => {
  const sendAuthData = ({ name, token }) =>
    ws.send(buildMessage({
      type: AUTH_LOGIN_TYPE_SEND,
      data: { name, token }
    }))
  const sendAuthCharSelectData = ({ characterId, worldId }) =>
    ws.send(buildMessage({
      type: AUTH_SELECT_CHARACTER_TYPE_SEND,
      data: { id: characterId, world_id: worldId }
    }))
  const sendGetCharacterInfo = () =>
    ws.send(buildMessage({
      type: CHARACTER_INFO_TYPE_SEND,
      data: {}
    }))
  const sendGetPresetsForVillage = ({ villageId }) =>
    ws.send(buildMessage({
      type: ARMY_PRESETS_GET_FOR_VILLAGE_TYPE_SEND,
      data: { village_id: villageId }
    }))
  const sendGetVillagesByArea = ({ x, y, width, height }) =>
    ws.send(buildMessage({
      type: MAP_VILLAGES_BY_AREA_TYPE_SEND,
      data: { x, y, width, height }
    }))
  const sendGetVillageDetails = ({ originVillageId, targetVillageId }) =>
    ws.send(buildMessage({
      type: MAP_VILLAGES_DETAILS_TYPE_SEND,
      data: { my_village_id: originVillageId, village_id: targetVillageId, num_reports: 0 }
    }))
  const sendPresetAttack = ({ presetId, sourceVillageId, targetVillageId }) =>
    ws.send(buildMessage({
      type: COMMAND_SEND_PRESET_TYPE_SEND,
      data: { army_preset_id: presetId, start_village: sourceVillageId, target_village: targetVillageId, type: 'attack' }
    }))

  const sendCustomArmy = ({ sourceVillageId, targetVillageId, type, units }) =>
    ws.send(buildMessage({
      type: COMMAND_SEND_CUSTOM_ARMY_TYPE_SEND,
      data: { start_village: sourceVillageId, target_village: targetVillageId, type, units, catapult_target: 'headquarter', icon: 0, officers: {} }
    }))
  const sendGetVillagesInfo = () =>
    ws.send(buildMessage({
      type: ICON_GET_VILLAGES_TYPE_SEND,
      data: {}
    }))
  const sendBarracksRecruit = ({ amount, unitType, villageId }) =>
    ws.send(buildMessage({
      type: BARRACKS_RECRUIT_TYPE_SEND,
      data: { amount, unit_type: unitType, village_id: villageId }
    }))
  const sendHooRecruit = ({ amount, unitType, villageId }) =>
    ws.send(buildMessage({
      type: HOO_RECRUIT_TYPE_SEND,
      data: { amount, unit_type: unitType, village_id: villageId }
    }))
  const sendGetVillagesData = ({ villageIds }) =>
    ws.send(buildMessage({
      type: VILLAGES_DATA_TYPE_SEND,
      data: { village_ids: villageIds }
    }))
  const sendSpyRecruitData = ({ villageId, slot }) =>
    ws.send(buildMessage({
      type: SCOUTING_RECRUIT_TYPE_SEND,
      data: { village_id: villageId, slot }
    }))
  const sendGetGroups = () =>
    ws.send(buildMessage({
      type: GROUPS_TYPE_SEND,
      data: {}
    }))
  const sendMassDonation = ({ villages }) =>
    ws.send(buildMessage({
      type: MASS_DONATION_SEND,
      data: { villages }
    }))
  const sendGetGameData = () =>
    ws.send(buildMessage({
      type: GAME_DATA_SEND,
      data: {}
    }))

  const debouncedSendInfo = _.debounce(sendGetCharacterInfo, 1000)
  const close = async (message, opts = {}) => {
    message && console.error(`DONE: ${message}`)
    const { playerVillagesLeft } = opts
    if (playerVillagesLeft) {
      console.log(`Checking for [${playerVillagesLeft}] more village(s)`)
      console.log('=====================================================================================')

      // Make sure that all previous actions are executed before starting with new one
      return debouncedSendInfo()
    } else {
      console.log('FINISHED: No more villages')
    }

    ws.close()
  }

  return {
    sendAuthData,
    sendAuthCharSelectData,
    sendGetCharacterInfo,
    sendGetPresetsForVillage,
    sendGetVillagesByArea,
    sendGetVillageDetails,
    sendPresetAttack,
    sendCustomArmy,
    sendGetVillagesInfo,
    sendBarracksRecruit,
    sendHooRecruit,
    sendGetVillagesData,
    sendSpyRecruitData,
    sendGetGroups,
    sendMassDonation,
    sendGetGameData,
    close
  }
}

export default senders

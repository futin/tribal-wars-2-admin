// node core modules

// 3rd party modules

// local modules
import {
  AUTH_LOGIN_TYPE_SEND, AUTH_SELECT_CHARACTER_TYPE_SEND, MAP_VILLAGES_BY_AREA_TYPE_SEND, CHARACTER_INFO_TYPE_SEND,
  ARMY_PRESETS_GET_FOR_VILLAGE_TYPE_SEND, COMMAND_SEND_PRESET_TYPE_SEND, ICON_GET_ATTACKING_VILLAGES_TYPE_SEND,
  BARRACKS_RECRUIT_TYPE_SEND
} from './constants'
import { buildMessage } from './utils'

const senders = ws => {
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
  const sendPresetAttack = ({ presetId, sourceVillageId, targetVillageId }) =>
    ws.send(buildMessage({
      type: COMMAND_SEND_PRESET_TYPE_SEND,
      data: { army_preset_id: presetId, start_village: sourceVillageId, target_village: targetVillageId, type: 'attack' }
    }))
  const sendGetAttackedVillages = () =>
    ws.send(buildMessage({
      type: ICON_GET_ATTACKING_VILLAGES_TYPE_SEND,
      data: {}
    }))
  const sendBarracksRecruit = ({ amount, unitType, villageId }) =>
    ws.send(buildMessage({
      type: BARRACKS_RECRUIT_TYPE_SEND,
      data: { amount, unit_type: unitType, village_id: villageId }
    }))

  const close = (message, opts = {}) => {
    message && console.error(`DONE: ${message}`)
    const { playerVillagesLeft } = opts
    if (playerVillagesLeft) {
      console.log(`Checking for [${playerVillagesLeft}] more village(s)`)
      console.log('=====================================================================================')
      return sendGetCharacterInfo()
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
    sendPresetAttack,
    sendGetAttackedVillages,
    sendBarracksRecruit,
    close
  }
}

module.exports = senders

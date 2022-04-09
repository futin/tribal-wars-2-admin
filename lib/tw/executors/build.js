// node core modules

// 3rd party modules
import _ from 'lodash'
import { delay } from 'promises-to-retry'
import transform from 'oniyi-object-transform'

// local modules
import { roundRandomWithRange } from '../../utils'
import {
  AUTH_LOGIN_SUCCESS_TYPE_RECEIVE,
  MAP_VILLAGES_TYPE_RECEIVE,
  CHARACTER_INFO_TYPE_RECEIVE,
  ARMY_PRESETS_FOR_VILLAGE_TYPE_RECEIVE,
  COMMAND_SENT_PRESET_TYPE_RECEIVE,
  SYSTEM_ERROR_TYPE_RECEIVE,
  ICON_GET_VILLAGES_TYPE_RECEIVE,
  AUTHENTICATION_CHARACTER_SELECTED_TYPE_RECEIVE,
  COMMAND_SEND_PRESET_TYPE_SEND,
  SYSTEM_ERROR_COMMAND_NOT_ENOUGH_UNITS_ERROR,
  SYSTEM_ERROR_ATTACK_LIMIT_EXCEEDED_ERROR,
  VILLAGES_DATA_TYPE_RECEIVE
} from '../../constants'

const mappedResourceTypes = {
  food: 'Provisions',
  iron: 'Iron',
  clay: 'Clay',
  wood: 'Wood'
}

const executors = ({ senders }) => {
  const executionInstance = {}

  return ({
    [AUTH_LOGIN_SUCCESS_TYPE_RECEIVE]: ({ response, config }) => {
      const { worldName } = config.auth
      const characters = _.get(response, 'data.characters', [])
      let character = characters[0]

      if (worldName) character = characters.find(character => character.world_name === worldName) || character

      const { character_id: characterId, world_id: worldId } = character

      senders.sendAuthCharSelectData({ characterId, worldId })
    },
    [AUTHENTICATION_CHARACTER_SELECTED_TYPE_RECEIVE]: ({ response }) => {
      const ownerId = _.get(response, 'data.owner_id')
      if (ownerId) return senders.sendGetCharacterInfo()
      senders.close('Character not found')
    },
    [CHARACTER_INFO_TYPE_RECEIVE]: ({ response, config }) => {
      if (!config.isBuild) return console.log('Not called for building')
      const { villageName, buildingOrder, buildingPriority } = config
      const characterVillages = _.get(response, 'data.villages')

      const selectedVillage = characterVillages.find(village => village.name === villageName)
      if (!selectedVillage) return senders.close(`Village for the name [${villageName}] not found`)

      Object.assign(executionInstance, { selectedVillage })

      senders.sendGetVillagesData({ villageIds: [selectedVillage.id] })
    },
    [VILLAGES_DATA_TYPE_RECEIVE]: ({ response }) => {
      const resources = _.reduce(response.data, (result, villageInfo) => {
        const availableResources = _.get(villageInfo, 'Village/village.resources')
        const storage = _.get(villageInfo, 'Village/village.storage')
        const village = _.get(villageInfo, 'Village/village')

        const mappedResources = transform({
          src: availableResources,
          map: mappedResourceTypes
        })

        _.set(result, village.name, { ...mappedResources, Storage: storage })

        return result
      }, {})

      senders.close('Done')
    },
    [ICON_GET_VILLAGES_TYPE_RECEIVE]: ({ response, config }) => {
      const { barbarianVillagesToIgnore } = config
      const { selectedVillage } = executionInstance
      let barbarianVillageIdsToIgnore = []
      const commands = _.get(response, 'data.commands', {})
      const { toAttack, fromAttack } = _.reduce(commands, (result, attackInfo = {}, village) => {
        village = parseInt(village, 10)
        if (attackInfo.attacking) result.toAttack.push(village)
        if (attackInfo.attacking_back) result.fromAttack.push(village)
        return result
      }, { toAttack: [], fromAttack: [] })

      if (barbarianVillagesToIgnore.toAttack) barbarianVillageIdsToIgnore = toAttack
      if (barbarianVillagesToIgnore.fromAttack) barbarianVillageIdsToIgnore = barbarianVillageIdsToIgnore.concat(fromAttack)

      _.merge(executionInstance, { barbarianVillageIdsToIgnore })

      senders.sendGetPresetsForVillage({ villageId: selectedVillage.id })
    },
    [ARMY_PRESETS_FOR_VILLAGE_TYPE_RECEIVE]: ({ response, config }) => {
      const { barbarianVillagesArea: { width, height }, presetsNameStartsWith } = config
      const { preferredPresetsOrder = [] } = executionInstance.selectedVillage
      const villagePresets = _.get(response, 'data.presets')
      let presets = villagePresets
      if (preferredPresetsOrder.length) {
        presets = preferredPresetsOrder.map(presetName => {
          const presetIndex = villagePresets.findIndex(p => p.name === presetName)
          if (presetIndex !== -1) return villagePresets.splice(presetIndex, 1)[0]
        })
          .filter(Boolean)
          .concat(villagePresets)
      } else if (presetsNameStartsWith) {
        presets = villagePresets.filter(({ name }) => name.startsWith(presetsNameStartsWith))
      }

      _.merge(executionInstance, { selectedVillage: { presets } })
      const { selectedVillage } = executionInstance

      // since width and height are only looking into positive values from provided x & y
      // in order to make a circle (radius) of the provided width & height we need to
      // divide these values by 2 and subtract them from original x&y
      const x = selectedVillage.x - Math.round(width / 2)
      const y = selectedVillage.y - Math.round(height / 2)

      // now that we have all presets for the village, lets load barbarian villages!
      senders.sendGetVillagesByArea({ x, y, width, height })
    },
    [MAP_VILLAGES_TYPE_RECEIVE]: ({ response, config }) => {
      let { barbarianVillageNamesToIgnore, nonBarbarianVillagesPointsLimit = 0, barbarianVillagesPointsLimit = 0 } = config
      const { selectedVillage: { name }, barbarianVillageIdsToIgnore, playerVillagesLeft } = executionInstance
      const villages = _.get(response, 'data.villages', [])

      if (!villages.length) {
        return senders.close('Barbarian villages not found. Make sure that provided "villagesArea" is correct')
      }

      // don't allow attacking bigger players by mistake
      if (nonBarbarianVillagesPointsLimit > 400) nonBarbarianVillagesPointsLimit = 400

      let barbarianVillages = villages.slice()

      if (nonBarbarianVillagesPointsLimit) {
        barbarianVillages = barbarianVillages
          .filter(({ character_points: characterPoints, attack_protection: attackProtection }) =>
            characterPoints <= nonBarbarianVillagesPointsLimit && !attackProtection)
          // transform village to barbarian
          .map(village => {
            if (village.character_id && village.character_name) {
              village.manualBarbarian = true
            }
            delete village.character_name
            delete village.character_id
            return village
          })
      }

      barbarianVillages = barbarianVillages
        .filter(({ character_name: characterName, character_id: characterId }) => !characterId && !characterName)

      if (barbarianVillagesPointsLimit) {
        barbarianVillages = barbarianVillages
          .filter(({ points, manualBarbarian }) => manualBarbarian || points >= barbarianVillagesPointsLimit)
      }

      if (barbarianVillageIdsToIgnore && barbarianVillageIdsToIgnore.length) {
        barbarianVillages = barbarianVillages
          .filter(({ id }) => !barbarianVillageIdsToIgnore.includes(id))
      }

      if (barbarianVillageNamesToIgnore && barbarianVillageNamesToIgnore.length) {
        barbarianVillages = barbarianVillages
          .filter(({ name }) => !barbarianVillageNamesToIgnore.includes(name))
      }

      if (!barbarianVillages.length) {
        return senders.close(`Barbarian villages not found from player village [${name}]`, { playerVillagesLeft })
      }

      // shuffle the barbarian villages so we don't create the attacking pattern
      barbarianVillages = _.shuffle(barbarianVillages)

      console.log(`Found ${barbarianVillages.length} barbarian villages from player village [${name}]`)

      Object.assign(executionInstance, { barbarianVillages, currentBarbarianIndex: 0, currentPresetIndex: 0 })

      return executePresetAttack()
    },
    [COMMAND_SENT_PRESET_TYPE_RECEIVE]: async ({ response }) => {
      const { barbarianVillages, currentBarbarianIndex } = executionInstance
      const commandId = _.get(response, 'data.command_id')
      const direction = _.get(response, 'data.direction')

      if (direction !== 'forward') return
      if (!commandId) {
        const barbarianVillage = barbarianVillages[currentBarbarianIndex] || {}
        return senders.close(`Command id not found for barbarian village ${barbarianVillage.id}:${barbarianVillage.name}`)
      }
      // batch the requests so we don't overwhelm the server
      if (currentBarbarianIndex % 3 === 0) await delay(roundRandomWithRange({ min: 2, max: 5 }) * 1000)

      executionInstance.currentBarbarianIndex += 1
      return executePresetAttack()
    },
    [SYSTEM_ERROR_TYPE_RECEIVE]: ({ response }) => {
      const errorCause = _.get(response, 'data.cause')
      const errorCode = _.get(response, 'data.code')
      const { selectedVillage: { name } = {}, playerVillagesLeft } = executionInstance

      if (errorCause === COMMAND_SEND_PRESET_TYPE_SEND && errorCode === SYSTEM_ERROR_COMMAND_NOT_ENOUGH_UNITS_ERROR) {
        executionInstance.currentPresetIndex += 1
        return executePresetAttack()
      }
      if (errorCause === COMMAND_SEND_PRESET_TYPE_SEND && errorCode === SYSTEM_ERROR_ATTACK_LIMIT_EXCEEDED_ERROR) {
        if (executionInstance.selectedVillage.attackLimitExceeded) {
          console.log(`~~~~~Attack limit exceeded bug [2] caught for village [${name}]~~~~~`)
          return
        }

        executionInstance.selectedVillage.attackLimitExceeded = true
        senders.close(`Attack limit exceeded for village [${name}]`, { playerVillagesLeft })
        return
      }

      senders.close(`Error: ${errorCause};${errorCode}`, { playerVillagesLeft })
    }
  })
}

export default executors

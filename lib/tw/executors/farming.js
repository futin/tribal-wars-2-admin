// node core modules

// 3rd party modules
import _ from 'lodash'
import { delay } from 'promises-to-retry'

// local modules
import { roundRandomWithRange } from '#global-utils'
import {
  MAP_VILLAGES_TYPE_RECEIVE, CHARACTER_INFO_TYPE_RECEIVE,
  ARMY_PRESETS_FOR_VILLAGE_TYPE_RECEIVE, COMMAND_SENT_PRESET_TYPE_RECEIVE, SYSTEM_ERROR_TYPE_RECEIVE,
  ICON_GET_VILLAGES_TYPE_RECEIVE, AUTHENTICATION_CHARACTER_SELECTED_TYPE_RECEIVE,
  COMMAND_SEND_PRESET_TYPE_SEND, SYSTEM_ERROR_COMMAND_NOT_ENOUGH_UNITS_ERROR, SYSTEM_ERROR_ATTACK_LIMIT_EXCEEDED_ERROR,
  UNITS_INFO_RECEIVE, VILLAGES_DATA_TYPE_RECEIVE
} from '#global-constants'

const executors = ({ senders }) => {
  const executionInstance = {}

  const executePresetAttack = async () => {
    const { selectedVillage: { id, name, presets }, barbarianVillages, currentBarbarianIndex, currentPresetIndex, playerVillagesLeft } = executionInstance
    if (!id || !presets || !barbarianVillages) {
      console.log('Presents or id not found')
      return senders.closeFarming(`Presents or id not found for village [${name}]`, { playerVillagesLeft })
    }

    const barbarianVillage = barbarianVillages[currentBarbarianIndex]
    const preset = presets[currentPresetIndex]

    if (!barbarianVillage) {
      return senders.closeFarming(`No more barbarian villages to attack from village [${name}]`, { playerVillagesLeft })
    }

    if (!preset) {
      return senders.closeFarming(`No more presets to select from village [${name}]`, { playerVillagesLeft })
    }

    if (executionInstance.selectedVillage.attackLimitExceeded) {
      console.log(`~~~~~Attack limit exceeded bug caught for village [${name}]~~~~~`)
      return
    }

    console.log(`Sending attack from [${name}] to [${barbarianVillage.name}] with preset [${preset.name}]
     Status: ${currentBarbarianIndex + 1}/${barbarianVillages.length}`)
    senders.sendPresetAttack({ presetId: preset.id, sourceVillageId: id, targetVillageId: barbarianVillage.id })
  }

  return ({
    [AUTHENTICATION_CHARACTER_SELECTED_TYPE_RECEIVE]: ({ response }) => {
      const ownerId = _.get(response, 'data.owner_id')
      if (ownerId) return senders.sendGetCharacterInfo()
      senders.closeFarming('Character not found')
    },
    [CHARACTER_INFO_TYPE_RECEIVE]: ({ response, config }) => {
      if (!config.isFarming) return console.log('Not called for farming')
      const { playerVillageNamesToIgnore = [], playerVillagesToAllow = [], shufflePlayerVillages, maxOutgoingAttacksAllowed } = config
      let characterVillages = _.get(response, 'data.villages')

      executionInstance.playerVillageNamesToIgnore = executionInstance.playerVillageNamesToIgnore || playerVillageNamesToIgnore

      if (playerVillagesToAllow.length) {
        // preserve the buildingOrder of allowed villages
        characterVillages = playerVillagesToAllow
          .map(({ name }) => characterVillages.find(village => village.name === name))
          .filter(Boolean)
      }

      if (executionInstance.playerVillageNamesToIgnore.length) {
        characterVillages = characterVillages.filter(({ name }) => !executionInstance.playerVillageNamesToIgnore.includes(name))
      }

      if (!characterVillages.length) {
        return senders.closeFarming('All villages are attacking')
      }

      if (shufflePlayerVillages) {
        characterVillages = _.shuffle(characterVillages)
      }

      const [selectedVillage] = characterVillages

      if (playerVillagesToAllow.length) {
        playerVillagesToAllow.forEach(({ name, preferredPresetsOrder, maxOutgoingAttacksAllowed: maxOutgoingAttacksAllowedByVillage }) => {
          if (selectedVillage.name === name) {
            selectedVillage.preferredPresetsOrder = preferredPresetsOrder
            // precedence is given to the village configuration
            selectedVillage.maxOutgoingAttacksAllowed = maxOutgoingAttacksAllowedByVillage || maxOutgoingAttacksAllowed || 50
          }
        })
      }

      executionInstance.playerVillageNamesToIgnore.push(selectedVillage.name)

      Object.assign(executionInstance, { selectedVillage, playerVillagesLeft: characterVillages.length - 1 })

      // get status of fromAttack villages
      senders.sendGetUnitsInfo({ villageId: selectedVillage.id })
    },
    [UNITS_INFO_RECEIVE]: ({ response }) => {
      const { selectedVillage, playerVillagesLeft } = executionInstance
      const outgoingArmiesList = _.get(response, 'data.outgoingArmies', [])

      const attacksLeft = selectedVillage.maxOutgoingAttacksAllowed - outgoingArmiesList.length

      if (attacksLeft <= 0) return senders.closeFarming(`Attack limit reached for village [${selectedVillage.name}]`, { playerVillagesLeft })

      _.set(executionInstance, 'selectedVillage.attacksLeft', attacksLeft)

      senders.sendGetVillagesInfo()
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

      senders.sendGetVillagesData({ villageIds: [selectedVillage.id] })
    },
    [VILLAGES_DATA_TYPE_RECEIVE]: ({ response, config }) => {
      const { selectedVillage, playerVillagesLeft } = executionInstance
      const { maxAllowedAvailableResourcesInPercentage } = config

      const villageData = response.data[selectedVillage.id]

      const storage = _.get(villageData, 'Village/village.storage')
      let availableResources = _.get(villageData, 'Village/village.resources')

      availableResources = _.pick(availableResources, ['wood', 'clay', 'iron'])

      const verifyAmountPercentage = resourceAmount =>
        Math.floor(resourceAmount / storage * 100) >= maxAllowedAvailableResourcesInPercentage

      if (_.every(availableResources, verifyAmountPercentage)) {
        return senders.closeFarming(`${selectedVillage.name} has enough resources`, { playerVillagesLeft })
      }

      senders.sendGetPresetsForVillage({ villageId: selectedVillage.id })
    },
    [ARMY_PRESETS_FOR_VILLAGE_TYPE_RECEIVE]: ({ response, config }) => {
      const { barbarianVillagesArea: { width, height }, presetsNameStartsWith } = config
      const { preferredPresetsOrder = [] } = executionInstance.selectedVillage
      const villagePresets = _.get(response, 'data.presets')
      let presets = villagePresets
      if (preferredPresetsOrder.length) {
        presets = preferredPresetsOrder.map((presetName) => {
          const presetIndex = villagePresets.findIndex(p => p.name === presetName)
          if (presetIndex !== -1) return villagePresets.splice(presetIndex, 1)[0]
          return null
        })
          .filter(Boolean)
          .concat(villagePresets)
      } else if (presetsNameStartsWith) {
        presets = villagePresets.filter(({ name }) => name.startsWith(presetsNameStartsWith))
      }

      _.merge(executionInstance, { selectedVillage: { presets } })
      const { selectedVillage } = executionInstance

      // since width and height are only looking into positive values from provided x & y
      // in buildingOrder to make a circle (radius) of the provided width & height we need to
      // divide these values by 2 and subtract them from original x&y
      const x = selectedVillage.x - Math.round(width / 2)
      const y = selectedVillage.y - Math.round(height / 2)

      // now that we have all presets for the village, lets load barbarian villages!
      senders.sendGetVillagesByArea({ x, y, width, height })
    },
    [MAP_VILLAGES_TYPE_RECEIVE]: ({ response, config }) => {
      let { barbarianVillageNamesToIgnore, maxNonBarbarianVillagesPoints = 0, minBarbarianVillagePoints = 0 } = config
      const { selectedVillage: { name, attacksLeft }, barbarianVillageIdsToIgnore, playerVillagesLeft } = executionInstance
      const villages = _.get(response, 'data.villages', [])

      if (!villages.length) {
        return senders.closeFarming('Barbarian villages not found. Make sure that provided "villagesArea" is correct')
      }

      // don't allow attacking bigger players by mistake
      if (maxNonBarbarianVillagesPoints > 400) maxNonBarbarianVillagesPoints = 400

      let barbarianVillages = villages.slice()

      if (maxNonBarbarianVillagesPoints) {
        barbarianVillages = barbarianVillages
          .filter(({ character_points: characterPoints, attack_protection: attackProtection }) =>
            characterPoints <= maxNonBarbarianVillagesPoints && !attackProtection)
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

      if (minBarbarianVillagePoints) {
        barbarianVillages = barbarianVillages
          .filter(({ points, manualBarbarian }) => manualBarbarian || points >= minBarbarianVillagePoints)
      }

      if (barbarianVillageIdsToIgnore && barbarianVillageIdsToIgnore.length) {
        barbarianVillages = barbarianVillages
          .filter(({ id }) => !barbarianVillageIdsToIgnore.includes(id))
      }

      if (barbarianVillageNamesToIgnore && barbarianVillageNamesToIgnore.length) {
        barbarianVillages = barbarianVillages
          .filter(({ name }) => !barbarianVillageNamesToIgnore.includes(name))
      }

      // shuffle the barbarian villages so that we don't create an attacking pattern
      barbarianVillages = _.shuffle(barbarianVillages)

      // reduce the number of barbarian villages to attack by the actual attacks left
      barbarianVillages = barbarianVillages.slice(0, attacksLeft)

      if (!barbarianVillages.length) {
        return senders.closeFarming(`Barbarian villages not found from player village [${name}]`, { playerVillagesLeft })
      }

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
        return senders.closeFarming(`Command id not found for barbarian village ${barbarianVillage.id}:${barbarianVillage.name}`)
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
        senders.closeFarming(`Attack limit exceeded for village [${name}]`, { playerVillagesLeft })
        return
      }

      senders.closeFarming(`Error: ${errorCause};${errorCode}`, { playerVillagesLeft })
    }
  })
}

export default executors

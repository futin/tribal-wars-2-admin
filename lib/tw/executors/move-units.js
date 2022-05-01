// 3rd party modules
import _ from 'lodash'

// local modules
import {
  AUTH_LOGIN_SUCCESS_TYPE_RECEIVE,
  CHARACTER_INFO_TYPE_RECEIVE,
  SYSTEM_ERROR_TYPE_RECEIVE,
  AUTHENTICATION_CHARACTER_SELECTED_TYPE_RECEIVE,
  VILLAGES_DATA_TYPE_RECEIVE,
  COMMAND_SENT_PRESET_TYPE_RECEIVE,
  MESSAGE_ERROR_TYPE_RECEIVE
} from '#global-constants'
import { delay } from 'promises-to-retry'
import { roundRandomWithRange } from '#global-utils'

const executors = ({ senders }) => {
  const executionInstance = { isMoveUnits: true }

  const prepareRelocateUnits = async (config) => {
    const {
      maxRelocationOperationsPerVillage,
      maxRelocationUnitsPerVillage,
      units
    } = config
    const { sourceVillages, targetVillages } = executionInstance

    const currentSourceVillage = sourceVillages.shift()
    if (!currentSourceVillage) {
      return senders.close('No more source villages')
    }

    const { availableUnits, id: sourceVillageId, name: sourceVillageName } = currentSourceVillage
    let totalPlannedUnitsToRelocate = 0
    let totalPlannedOperations = 0

    const moveInstructions = _.reduce(targetVillages, (result, { id: targetVillageId, name: targetVillageName, availableProvisions }) => {
      const transformedUnits = units.reduce((unitsResult, { amount, unitType }) => {
        const { total } = availableUnits[unitType] || {}

        // if there are no more units of this type, return
        if (!total || amount <= 0) return unitsResult

        const unitsToMove = Math.min(total, amount)

        availableProvisions -= unitsToMove
        totalPlannedUnitsToRelocate += unitsToMove
        totalPlannedOperations += 1

        // if we reached limit for this target village
        if (availableProvisions < 0 ||
          // if we reached limit of maximum relocation units per village
          totalPlannedUnitsToRelocate > maxRelocationUnitsPerVillage ||
          // if we reached limit of maximum relocation operations per village
          totalPlannedOperations > maxRelocationOperationsPerVillage
        ) return unitsResult

        Object.assign(unitsResult, { [unitType]: unitsToMove })
        return unitsResult
      }, {})

      if (_.isEmpty(transformedUnits)) {
        return result
      }

      const completeMoveInstruction = {
        type: 'relocate',
        sourceVillageId,
        sourceVillageName,
        targetVillageId,
        targetVillageName,
        units: transformedUnits
      }

      return result.concat(completeMoveInstruction)
    }, [])

    Object.assign(executionInstance, { currentSourceVillage, moveInstructions })

    return executeRelocateUnits()
  }

  const executeRelocateUnits = async () => {
    const { currentSourceVillage, moveInstructions, sourceVillages } = executionInstance

    const { name } = currentSourceVillage

    const moveInstruction = moveInstructions.shift()
    if (!moveInstruction) {
      console.log(`No more move instructions for [${name}]`)
      if (!sourceVillages.length) return senders.close('No more source villages for relocation')

      return senders.sendGetCharacterInfo()
    }

    if (moveInstructions.length % 3 === 0) await delay(roundRandomWithRange({ min: 1, max: 3 }) * 1000)

    const { units, sourceVillageName, targetVillageName } = moveInstruction
    const unitsText = _.map(units, (amount, type) => `[${type}:${amount}]`).join(', ')
    console.log(`Relocating units from [${sourceVillageName}] to [${targetVillageName}]
     Units: ${unitsText}
     Status: ${moveInstructions.length} left`)

    senders.sendCustomArmy(moveInstruction)
  }

  return {
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
      if (!config.isMoveUnits) return console.log('Not called for moving units')

      const characterVillages = _.get(response, 'data.villages')
      const villageIds = characterVillages.map(({ id }) => id)
      senders.sendGetVillagesData({ villageIds })
    },
    [VILLAGES_DATA_TYPE_RECEIVE]: ({ response, config }) => {
      const {
        sourceVillageAvailableProvisionsThreshold,
        targetVillageAvailableProvisionsThreshold,
        sourceVillageNamesToIgnore = [],
        targetVillageNamesToIgnore = [],
        units,
        presetConfigName
      } = config
      let { sourceVillages } = executionInstance

      if (!units?.length && !presetConfigName) {
        return senders.close('At least units or presetConfigName must be provided')
      }

      sourceVillages = sourceVillages || _
        .map(response.data, (villageInfo) => {
          const { name, villageId: id, resources: { food: availableProvisions } } = _.get(villageInfo, 'Village/village')
          const availableUnits = _.get(villageInfo, 'Village/unitInfo.available_units')

          if (sourceVillageNamesToIgnore.includes(name)) return null
          if (sourceVillageAvailableProvisionsThreshold < availableProvisions) return null

          return { name, id, availableProvisions, availableUnits }
        })
        .filter(Boolean)

      const targetVillages = _
        .map(response.data, (villageInfo) => {
          const { name, villageId: id, resources: { food: availableProvisions }, loyalty } = _.get(villageInfo, 'Village/village')

          if (loyalty < 100) return null
          if (targetVillageNamesToIgnore.includes(name)) return null
          if (targetVillageAvailableProvisionsThreshold > availableProvisions) return null

          return { name, id, availableProvisions }
        })
        .filter(Boolean)
        .sort((v1, v2) => v2.availableProvisions - v1.availableProvisions)

      if (!targetVillages.length) return senders.close('Not enough target villages for relocation')
      if (!sourceVillages.length) return senders.close('Not enough source villages for relocation')

      Object.assign(executionInstance, { sourceVillages: _.shuffle(sourceVillages), targetVillages })

      return prepareRelocateUnits(config)
    },
    [COMMAND_SENT_PRESET_TYPE_RECEIVE]: async ({ response }) => {
      if (!executionInstance.isMoveUnits) return
      const commandId = _.get(response, 'data.command_id')
      const direction = _.get(response, 'data.direction')

      if (direction !== 'forward') return
      if (!commandId) {
        return senders.close('Command id not found')
      }

      return executeRelocateUnits()
    },
    [SYSTEM_ERROR_TYPE_RECEIVE]: ({ response }) => {
      if (!executionInstance.isMoveUnits) return

      const errorCause = _.get(response, 'data.cause')
      const errorCode = _.get(response, 'data.code')

      console.log(`Error: ${errorCause};${errorCode}`)
      return executeRelocateUnits()
    },
    [MESSAGE_ERROR_TYPE_RECEIVE]: ({ response }) => {
      if (!executionInstance.isMoveUnits) return

      const errorCause = _.get(response, 'data.message')
      const errorCode = _.get(response, 'data.error_code')

      console.log(`Error: ${errorCause};${errorCode}`)
      return executeRelocateUnits()
    }
  }
}

export default executors

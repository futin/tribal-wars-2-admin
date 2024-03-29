// 3rd party modules
import _ from 'lodash'

// local modules
import {
  CHARACTER_INFO_TYPE_RECEIVE,
  SYSTEM_ERROR_TYPE_RECEIVE,
  AUTHENTICATION_CHARACTER_SELECTED_TYPE_RECEIVE,
  VILLAGES_DATA_TYPE_RECEIVE,
  COMMAND_SENT_PRESET_TYPE_RECEIVE,
  MESSAGE_ERROR_TYPE_RECEIVE, ARMY_PRESETS_LIST_TYPE_RECEIVE, GAME_DATA_RECEIVE
} from '#global-constants'
import { delay } from 'promises-to-retry'
import { roundRandomWithRange } from '#global-utils'

const executors = ({ senders, emitterKey }) => {
  const executionInstance = { isRelocateUnits: true }

  const prepareRelocateUnits = async (config) => {
    const {
      maxRelocationOperationsPerVillage,
      maxRelocationUnitsPerVillage,
      units
    } = config
    const { currentSourceVillage, targetVillages, unitRequiredProvisionByType } = executionInstance

    const { availableUnits, id: sourceVillageId, name: sourceVillageName } = currentSourceVillage
    let totalPlannedUnitsToRelocate = 0
    let totalPlannedOperations = 0

    const relocateInstructions = _.reduce(targetVillages, (result, target) => {
      const { id: targetVillageId, name: targetVillageName } = target

      const transformedUnits = _.reduce(units, (unitsResult, amount, unitType) => {
        const { in_town: unitsInTown } = availableUnits[unitType] || {}

        // if there are no more units of this type, return
        if (unitsInTown <= 0 || amount <= 0) return unitsResult

        const costOfSingleUnit = unitRequiredProvisionByType[unitType]
        const unitsToRelocate = Math.min(unitsInTown, amount)
        const unitsToRelocateProvisionCost = unitsToRelocate * costOfSingleUnit

        target.availableProvisions -= unitsToRelocateProvisionCost
        availableUnits[unitType].in_town -= unitsToRelocate
        totalPlannedUnitsToRelocate += unitsToRelocate
        totalPlannedOperations += 1

        // if we reached limit for this target village
        if (target.availableProvisions < 0 ||
          // if we reached limit for this source village
          currentSourceVillage.total < 0 ||
          // if we reached limit of maximum relocation units per village
          totalPlannedUnitsToRelocate > maxRelocationUnitsPerVillage ||
          // if we reached limit of maximum relocation operations per village
          totalPlannedOperations > maxRelocationOperationsPerVillage
        ) return unitsResult

        Object.assign(unitsResult, { [unitType]: unitsToRelocate })
        return unitsResult
      }, {})

      if (_.isEmpty(transformedUnits)) {
        return result
      }

      const completeRelocateInstruction = {
        type: 'relocate',
        sourceVillageId,
        sourceVillageName,
        targetVillageId,
        targetVillageName,
        units: transformedUnits
      }

      return result.concat(completeRelocateInstruction)
    }, [])

    Object.assign(executionInstance, { currentSourceVillage, relocateInstructions })

    return executeRelocateUnits()
  }

  const executeRelocateUnits = async () => {
    const { currentSourceVillage, relocateInstructions, sourceVillages } = executionInstance

    const { name } = currentSourceVillage

    const relocateInstruction = relocateInstructions.shift()
    if (!relocateInstruction) {
      console.log(`No more relocate instructions for [${name}]`)
      if (!sourceVillages.length) return senders.close('No more source villages for relocation', { emitterKey })

      return senders.sendGetCharacterInfo()
    }

    if (relocateInstructions.length % 3 === 0) await delay(roundRandomWithRange({ min: 1, max: 3 }) * 1000)

    const { units, sourceVillageName, targetVillageName } = relocateInstruction
    const unitsText = _.map(units, (amount, type) => `[${type}:${amount}]`).join(', ')
    console.log(`Relocating units from [${sourceVillageName}] to [${targetVillageName}]
     Units: ${unitsText}
     Status: ${relocateInstructions.length} left`)

    senders.sendCustomArmy(relocateInstruction)
  }

  return {
    [AUTHENTICATION_CHARACTER_SELECTED_TYPE_RECEIVE]: ({ response }) => {
      const ownerId = _.get(response, 'data.owner_id')
      if (ownerId) return senders.sendGetPresetsList()
      senders.close('Character not found', { emitterKey })
    },
    [ARMY_PRESETS_LIST_TYPE_RECEIVE]: ({ response, config }) => {
      if (!config.isRelocateUnits) return console.log('Not called for relocating units')
      const presetsList = _.get(response, 'data.presets')

      Object.assign(executionInstance, { presetsList })
      senders.sendGetGameData()
    },
    [GAME_DATA_RECEIVE]: ({ response }) => {
      const allUnitsInfo = _.get(response, 'data.GameData/units')
      const unitRequiredProvisionByType = _.reduce(allUnitsInfo, (result, unitsData, unitType) => ({ ...result, [unitType]: unitsData.food }), {})

      Object.assign(executionInstance, { unitRequiredProvisionByType })

      senders.sendGetCharacterInfo()
    },
    [CHARACTER_INFO_TYPE_RECEIVE]: ({ response }) => {
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
      let { sourceVillages, presetsList } = executionInstance

      if (!units && !presetConfigName) {
        return senders.close('At least units or presetConfigName must be provided', { emitterKey })
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

      // if preset config name is provided, we need to update the units and
      // filter out some source villages
      if (presetConfigName) {
        const preset = presetsList.find(({ name }) => presetConfigName === name)
        if (!preset) return senders.close('Invalid preset name provided', { emitterKey })
        sourceVillages = sourceVillages.filter(({ id }) => preset.assigned_villages.includes(id))
        config.units = preset.units
      }

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

      if (!targetVillages.length) return senders.close('Not enough target villages for relocation', { emitterKey })
      if (!sourceVillages.length) return senders.close('Not enough source villages for relocation', { emitterKey })

      const currentSourceVillage = sourceVillages.shift()

      Object.assign(executionInstance, { sourceVillages: _.shuffle(sourceVillages), targetVillages, currentSourceVillage })

      return prepareRelocateUnits(config)
    },
    [COMMAND_SENT_PRESET_TYPE_RECEIVE]: async ({ response }) => {
      if (!executionInstance.isRelocateUnits) return
      const commandId = _.get(response, 'data.command_id')
      const direction = _.get(response, 'data.direction')

      if (direction !== 'forward') return
      if (!commandId) {
        return senders.close('Command id not found', { emitterKey })
      }

      return executeRelocateUnits()
    },
    [SYSTEM_ERROR_TYPE_RECEIVE]: ({ response }) => {
      if (!executionInstance.isRelocateUnits) return

      const errorCause = _.get(response, 'data.cause')
      const errorCode = _.get(response, 'data.code')

      console.log(`Error: ${errorCause};${errorCode}`)
      return executeRelocateUnits()
    },
    [MESSAGE_ERROR_TYPE_RECEIVE]: ({ response }) => {
      if (!executionInstance.isRelocateUnits) return

      const errorCause = _.get(response, 'data.message')
      const errorCode = _.get(response, 'data.error_code')

      console.log(`Error: ${errorCause};${errorCode}`)
      return executeRelocateUnits()
    }
  }
}

export default executors

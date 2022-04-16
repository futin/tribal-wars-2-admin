
// 3rd party modules
import _ from 'lodash'
import { delay } from 'promises-to-retry'

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
import { roundRandomWithRange } from '#global-utils'
import { transformTargetCoordinates } from './utils.js'

const allowedMoveTypes = ['relocate', 'support']

const executors = ({ senders }) => {
  const executionInstance = { isMoveUnits: true }
  const executeMoveUnits = async () => {
    const { moveInstructions, moveInstructionsIndex, targetVillageName } = executionInstance

    const moveInstruction = moveInstructions[moveInstructionsIndex]
    if (!moveInstruction) {
      return senders.close('No more move instructions')
    }

    // batch the requests so we don't overwhelm the server
    if (moveInstructionsIndex % 3 === 0) await delay(roundRandomWithRange({ min: 1, max: 3 }) * 1000)

    const { sourceVillageName, type, units } = moveInstruction

    const unitsText = _.map(units, (amount, type) => `[${type}:${amount}]`).join(', ')
    console.log(`Moving(${type}) units from [${sourceVillageName}] to [${targetVillageName}]
     Units: ${unitsText}
     Status: ${moveInstructionsIndex + 1}/${moveInstructions.length}`)

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
      let { targetVillageName, targetVillageCoordinates, units, type, playerVillageNamesToIgnore, playerVillageNamesToAllow } = config
      if (!(units && units.length)) {
        return senders.close('Units can`t be empty')
      }

      if (!allowedMoveTypes.includes(type)) {
        return senders.close('Move types not allowed')
      }

      const fullTargetVillage = _.find(response.data, (villageInfo) => {
        const { name, x, y } = _.get(villageInfo, 'Village/village')
        if (targetVillageName && name === targetVillageName) return true
        if (!targetVillageCoordinates || !targetVillageCoordinates.includes('|')) return
        targetVillageCoordinates = targetVillageCoordinates.replace(/\s/g, '')

        const transformedCoordinates = transformTargetCoordinates([targetVillageCoordinates])
        if (!transformedCoordinates.length) return
        const [{ x: targetX, y: targetY }] = transformedCoordinates

        return targetX === x && targetY === y
      })

      if (!fullTargetVillage) {
        return senders.close('Target not found for provided params')
      }

      const targetVillageId = _.get(fullTargetVillage, 'Village/village.villageId')
      targetVillageName = _.get(fullTargetVillage, 'Village/village.name')
      Object.assign(executionInstance, { targetVillageName })

      const moveInstructions = _.reduce(response.data, (result, villageInfo) => {
        const availableUnits = _.get(villageInfo, 'Village/unitInfo.available_units')
        const village = _.get(villageInfo, 'Village/village')

        // ignore ignored villages
        if (playerVillageNamesToIgnore && playerVillageNamesToIgnore.length && playerVillageNamesToIgnore.includes(village.name)) return result

        // ignore non-allowed villages
        if (playerVillageNamesToAllow && playerVillageNamesToAllow.length && !playerVillageNamesToAllow.includes(village.name)) return result

        // and ignore target village
        if (village.villageId === targetVillageId) return result

        const transformUnits = units.reduce((unitsResult, { amount, unitType }) => {
          const { total } = availableUnits[unitType] || {}
          if (!total) {
            return unitsResult
          }

          const unitsToMove = Math.min(total, amount)
          if (!unitsToMove) {
            return unitsResult
          }

          Object.assign(unitsResult, { [unitType]: unitsToMove })
          return unitsResult
        }, {})

        if (_.isEmpty(transformUnits)) {
          return result
        }

        const completeMoveInstruction = {
          type,
          sourceVillageId: village.villageId,
          sourceVillageName: village.name,
          targetVillageId: targetVillageId,
          units: transformUnits
        }

        return result.concat(completeMoveInstruction)
      }, [])

      Object.assign(executionInstance, { moveInstructions, moveInstructionsIndex: 0 })
      return executeMoveUnits()
    },
    [COMMAND_SENT_PRESET_TYPE_RECEIVE]: async ({ response }) => {
      if (!executionInstance.isMoveUnits) return
      const commandId = _.get(response, 'data.command_id')
      const direction = _.get(response, 'data.direction')

      if (direction !== 'forward') return
      if (!commandId) {
        return senders.close('Command id not found')
      }

      executionInstance.moveInstructionsIndex += 1
      return executeMoveUnits()
    },
    [SYSTEM_ERROR_TYPE_RECEIVE]: ({ response }) => {
      if (!executionInstance.isMoveUnits) return

      const errorCause = _.get(response, 'data.cause')
      const errorCode = _.get(response, 'data.code')
      executionInstance.moveInstructionsIndex += 1

      console.log(`Error: ${errorCause};${errorCode}`)
      return executeMoveUnits()
    },
    [MESSAGE_ERROR_TYPE_RECEIVE]: ({ response }) => {
      if (!executionInstance.isMoveUnits) return

      const errorCause = _.get(response, 'data.message')
      const errorCode = _.get(response, 'data.error_code')
      executionInstance.moveInstructionsIndex += 1

      console.log(`Error: ${errorCause};${errorCode}`)
      return executeMoveUnits()
    }
  }
}

export default executors

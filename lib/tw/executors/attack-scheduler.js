// node core modules

// 3rd party modules
import _ from 'lodash'
import { delay } from 'promises-to-retry'

// local modules
import {
  AUTH_LOGIN_SUCCESS_TYPE_RECEIVE, CHARACTER_INFO_TYPE_RECEIVE,
  ARMY_PRESETS_FOR_VILLAGE_TYPE_RECEIVE, COMMAND_SENT_PRESET_TYPE_RECEIVE, SYSTEM_ERROR_TYPE_RECEIVE,
  AUTHENTICATION_CHARACTER_SELECTED_TYPE_RECEIVE,
  COMMAND_SEND_PRESET_TYPE_SEND, SYSTEM_ERROR_ATTACK_LIMIT_EXCEEDED_ERROR
} from '../../constants'

const executors = ({ senders }) => {
  const executionInstance = {}

  const executeScheduledAttack = async () => {
    const { scheduledAttacks, scheduledAttackIndex = 0, activeScheduledAttack } = executionInstance
    const scheduledAttack = activeScheduledAttack || scheduledAttacks[scheduledAttackIndex]

    if (!scheduledAttack) {
      return senders.close('No more scheduled attacks')
    }

    const { id, name, target: { id: targetId, name: targetName }, presetConfig: { id: presetId, name: presetName } } = scheduledAttack
    // if we don't have presetId for this attack, fetch it first
    if (!presetId) {
      return senders.close('Something went wrong! PresetId should be present')
    }

    Object.assign(executionInstance, { activeScheduledAttack: scheduledAttack })
    console.log(`Sending attack from [${name}] to [${targetName}] with preset [${presetName}]
     Status: ${scheduledAttackIndex + 1}/${scheduledAttacks.length}`)
    senders.sendPresetAttack({ presetId, sourceVillageId: id, targetVillageId: targetId })
  }

  const collectPresets = () => {
    const { uniqueOriginVillageIds, originIdIndex } = executionInstance

    const uniqueOriginVillageId = uniqueOriginVillageIds[originIdIndex]
    if (!uniqueOriginVillageId) {
      console.log('All presets are collected')
      return executeScheduledAttack()
    }

    return senders.sendGetPresetsForVillage({ villageId: uniqueOriginVillageId })
  }

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
      if (!config.isAttackScheduler) return console.log('Not called for scheduled attacking')
      let { scheduledAttacks = [] } = config
      if (!scheduledAttacks.length) return senders.close('Scheduled attacks not provided')

      const allOriginVillages = _.get(response, 'data.villages', [])

      const characterVillageIdsByNames = allOriginVillages
        .reduce((result, village) => ({ ...result, [village.name]: village.id }), {})

      const characterVillageIdsByCoordinates = allOriginVillages
        .reduce((result, village) => ({ ...result, [`${village.x}-${village.y}`]: village.id }), {})

      scheduledAttacks = scheduledAttacks
        .map(scheduledAttack => {
          const { name, x, y } = scheduledAttack
          let id = characterVillageIdsByNames[name]
          if (!id) id = characterVillageIdsByCoordinates[`${x}-${y}`]
          if (!id) {
            console.log('Ignoring scheduled attack for', name)
            return
          }
          scheduledAttack.id = id
          return scheduledAttack
        })
        .filter(Boolean)

      if (!scheduledAttacks.length) {
        return senders.close('Scheduled attacks are invalid')
      }
      const uniqueOriginVillageIds = [...new Set(scheduledAttacks.map(({ id }) => id))]

      Object.assign(executionInstance, { scheduledAttacks, uniqueOriginVillageIds, originIdIndex: 0 })

      return collectPresets()
    },
    [ARMY_PRESETS_FOR_VILLAGE_TYPE_RECEIVE]: ({ response }) => {
      const villagePresets = _.get(response, 'data.presets')

      const villagePresetIdsByNames = villagePresets
        .reduce((result, village) => ({ ...result, [village.name]: village.id }), {})

      executionInstance.scheduledAttacks = executionInstance.scheduledAttacks.map(scheduledAttack => {
        const presetId = villagePresetIdsByNames[scheduledAttack.presetConfig.name]
        if (!presetId) return scheduledAttack
        scheduledAttack.presetConfig.id = presetId
        return scheduledAttack
      })
      executionInstance.originIdIndex += 1

      return collectPresets()
    },
    [COMMAND_SENT_PRESET_TYPE_RECEIVE]: async ({ response }) => {
      const { activeScheduledAttack = {} } = executionInstance
      let { name, target: { name: targetName }, presetConfig: { waitBetweenAttacksInMs = 500, numberOfAttacks = 1 } } = activeScheduledAttack

      const commandId = _.get(response, 'data.command_id')
      const direction = _.get(response, 'data.direction')

      if (direction !== 'forward') return
      if (!commandId) {
        return senders.close('Command id not found')
      }

      numberOfAttacks -= 1
      _.set(executionInstance, 'activeScheduledAttack.presetConfig.numberOfAttacks', numberOfAttacks)

      if (numberOfAttacks) {
        console.log(`Number of attacks left from [${name}] to [${targetName}] => [${numberOfAttacks}]`)
        await delay(waitBetweenAttacksInMs)
        return executeScheduledAttack()
      }

      delete executionInstance.activeScheduledAttack
      executionInstance.scheduledAttackIndex += 1
      return executeScheduledAttack()
    },
    [SYSTEM_ERROR_TYPE_RECEIVE]: ({ response }) => {
      const errorCause = _.get(response, 'data.cause')
      const errorCode = _.get(response, 'data.code')

      if (errorCause === COMMAND_SEND_PRESET_TYPE_SEND && errorCode === SYSTEM_ERROR_ATTACK_LIMIT_EXCEEDED_ERROR) {
        if (executionInstance.selectedVillage.attackLimitExceeded) {
          console.log('~~~~~Attack limit exceeded bug [2] caught')
          return
        }

        executionInstance.selectedVillage.attackLimitExceeded = true
        senders.close('Attack limit exceeded')
        return
      }

      senders.close(`Error: ${errorCause};${errorCode}`)
    }
  })
}

export default executors

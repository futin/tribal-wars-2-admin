
// 3rd party modules
import _ from 'lodash'
import { delay } from 'promises-to-retry'

// local modules
import { roundRandomWithRange } from '#global-utils'
import {
  AUTH_LOGIN_SUCCESS_TYPE_RECEIVE,
  CHARACTER_INFO_TYPE_RECEIVE,
  SYSTEM_ERROR_TYPE_RECEIVE,
  BARRACKS_RECRUIT_JOB_CREATED_TYPE_RECEIVE,
  HOO_RECRUIT_JOB_CREATED_TYPE_RECEIVE,
  BARRACKS_RECRUIT_TYPE_SEND,
  VILLAGE_INSUFFICIENT_RESOURCES_ERROR,
  AUTHENTICATION_CHARACTER_SELECTED_TYPE_RECEIVE,
  ICON_GET_VILLAGES_TYPE_RECEIVE,
  GROUPS_TYPE_RECEIVE
} from '#global-constants'

const executors = ({ senders, emitterKey }) => {
  const executionInstance = {}
  const ERROR_RESPONSE = { emitterKey, isError: true }

  const executeArmyRecruitment = async () => {
    const {
      selectedVillage: { id, name, recruitmentInstructions: villageRecruitmentInstructions = [] },
      recruitmentInstructions: overallRecruitmentInstructions = [],
      currentRecruitmentInstructionIndex,
      playerVillagesLeft,
      timeCompleted
    } = executionInstance
    // give buildingPriority to village recruitment
    let recruitmentInstructions = villageRecruitmentInstructions.length && villageRecruitmentInstructions
    if (!recruitmentInstructions) {
      recruitmentInstructions = overallRecruitmentInstructions.length && overallRecruitmentInstructions
    }

    if (!recruitmentInstructions) {
      return senders.close('Recruitment instructions not found! Please provide at least 1.', { playerVillagesLeft, errorCode: 'InvalidInstructions', ...ERROR_RESPONSE })
    }

    const recruitmentInstruction = recruitmentInstructions[currentRecruitmentInstructionIndex]

    if (!recruitmentInstruction) {
      return senders.close(`No more recruitment instructions for village [${name}]`, { playerVillagesLeft, emitterKey, emitterPayload: { timeCompleted } })
    }

    const { amount, unitType, isHOO } = recruitmentInstruction

    if (!amount || !unitType) {
      return senders.close(`Invalid instructions provided for village [${name}]`, { playerVillagesLeft, errorCode: 'InvalidInstructions', ...ERROR_RESPONSE })
    }

    // batch the requests so we don't overwhelm the server
    if (currentRecruitmentInstructionIndex % 3 === 0) await delay(roundRandomWithRange({ min: 1, max: 3 }) * 1000)

    console.log(`Recruiting from [${name}]: ${unitType} ${amount}
     Status: ${currentRecruitmentInstructionIndex + 1}/${recruitmentInstructions.length}`)

    if (isHOO) return senders.sendHooRecruit({ amount, unitType, villageId: id })
    senders.sendBarracksRecruit({ amount, unitType, villageId: id })
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
      if (ownerId) return senders.sendGetGroups()
      senders.close('Character not found', ERROR_RESPONSE)
    },
    [GROUPS_TYPE_RECEIVE]: ({ response }) => {
      const groups = _.get(response, 'data.groups')
      const groupNamesById = groups.reduce((result, group) => ({ ...result, [group.id]: group.name }), {})

      // save the collection of groups/tags
      Object.assign(executionInstance, { groupNamesById })
      senders.sendGetVillagesInfo()
    },
    [ICON_GET_VILLAGES_TYPE_RECEIVE]: ({ response, config }) => {
      const { groupNames: groups } = config
      if (!groups) return senders.sendGetCharacterInfo()
      const { groupNamesById } = executionInstance
      const villagesByGroupIds = _.get(response, 'data.groups', {})

      // parse the group ids into group names
      const villagesByGroupNames = _.reduce(villagesByGroupIds, (result, groupIds, villageId) =>
        ({ ...result, [villageId]: groupIds.map(groupId => groupNamesById[groupId]) }), {})

      // extract the village ids so we can use them in next step
      const allowedVillageIds = _
        .map(villagesByGroupNames, (groupNames, villageId) => groupNames.some(groupName => groups.includes(groupName)) && { id: parseInt(villageId, 10) })
        .filter(Boolean)

      Object.assign(executionInstance, { allowedVillageIds })
      senders.sendGetCharacterInfo()
    },
    [CHARACTER_INFO_TYPE_RECEIVE]: ({ response, config }) => {
      if (!config.isUnitRecruit) return console.log('Not called for unit recruiting')
      let { playerVillageNamesToIgnore = [], playerVillagesToAllow = [], recruitmentInstructions = [] } = config
      const { allowedVillageIds = [] } = executionInstance

      // concat the allowed villages provided by the user and allowed villages by group
      playerVillagesToAllow = playerVillagesToAllow.concat(allowedVillageIds)

      let characterVillages = _.get(response, 'data.villages')

      executionInstance.playerVillageNamesToIgnore = executionInstance.playerVillageNamesToIgnore || playerVillageNamesToIgnore

      if (playerVillagesToAllow.length) {
        // preserve the buildingOrder of allowed villages
        characterVillages = playerVillagesToAllow
          .map(({ name, id }) => characterVillages.find(village => village.name === name || village.id === id))
          .filter(Boolean)
      }

      if (executionInstance.playerVillageNamesToIgnore.length) {
        characterVillages = characterVillages.filter(({ name }) => !executionInstance.playerVillageNamesToIgnore.includes(name))
      }

      if (!characterVillages.length) {
        return senders.close('All villages are recruiting', ERROR_RESPONSE)
      }

      const [selectedVillage] = characterVillages

      if (playerVillagesToAllow.length) {
        playerVillagesToAllow.forEach(({ name, recruitmentInstructions = [] }) => {
          if (selectedVillage.name === name) selectedVillage.recruitmentInstructions = recruitmentInstructions
        })
      }

      executionInstance.playerVillageNamesToIgnore.push(selectedVillage.name)

      Object.assign(executionInstance, { selectedVillage, playerVillagesLeft: characterVillages.length - 1, recruitmentInstructions, currentRecruitmentInstructionIndex: 0 })

      executeArmyRecruitment()
    },
    [BARRACKS_RECRUIT_JOB_CREATED_TYPE_RECEIVE]: ({ response }) => {
      const { selectedVillage: { id }, playerVillagesLeft } = executionInstance
      if (!id) return console.log(`Invalid id for ${BARRACKS_RECRUIT_JOB_CREATED_TYPE_RECEIVE}`)
      const jobId = _.get(response, 'data.job_id')
      const timeCompleted = _.get(response, 'data.time_completed')
      const villageId = _.get(response, 'data.village_id')

      if (jobId && villageId === id) {
        executionInstance.currentRecruitmentInstructionIndex += 1
        executionInstance.timeCompleted = timeCompleted
        return executeArmyRecruitment()
      }

      return senders.close('No more recruitment jobs', { playerVillagesLeft, ...ERROR_RESPONSE })
    },
    [HOO_RECRUIT_JOB_CREATED_TYPE_RECEIVE]: ({ response }) => {
      const { selectedVillage: { id }, playerVillagesLeft } = executionInstance
      if (!id) return console.log(`Invalid id for ${BARRACKS_RECRUIT_JOB_CREATED_TYPE_RECEIVE}`)
      const jobId = _.get(response, 'data.job_id')
      const timeCompleted = _.get(response, 'data.time_completed')
      const villageId = _.get(response, 'data.village_id')

      if (jobId && villageId === id) {
        executionInstance.currentRecruitmentInstructionIndex += 1
        executionInstance.timeCompleted = timeCompleted
        return executeArmyRecruitment()
      }

      return senders.close('No more recruitment jobs', { playerVillagesLeft, ...ERROR_RESPONSE })
    },
    [SYSTEM_ERROR_TYPE_RECEIVE]: ({ response }) => {
      const errorCause = _.get(response, 'data.cause')
      const errorCode = _.get(response, 'data.code')
      const { selectedVillage: { name } = {}, playerVillagesLeft, timeCompleted } = executionInstance

      if (errorCause === BARRACKS_RECRUIT_TYPE_SEND && errorCode === VILLAGE_INSUFFICIENT_RESOURCES_ERROR) {
        senders.close(`Not enough resources for [${name}]. Either build farm or gather more resources`, { playerVillagesLeft, errorCode: 'InsufficientFunds', ...ERROR_RESPONSE, emitterPayload: { timeCompleted } })
        return
      }

      senders.close(`Error: ${errorCause};${errorCode}`, { playerVillagesLeft, ...ERROR_RESPONSE })
    }
  })
}

export default executors

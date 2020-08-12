
// 3rd party modules
import _ from 'lodash'
import { delay } from 'promises-to-retry'

// local modules
import { roundRandomWithRange } from '../../utils'
import {
  AUTH_LOGIN_SUCCESS_TYPE_RECEIVE, CHARACTER_INFO_TYPE_RECEIVE, SYSTEM_ERROR_TYPE_RECEIVE,
  BARRACKS_RECRUIT_JOB_CREATED_TYPE_RECEIVE,
  BARRACKS_RECRUIT_TYPE_SEND, VILLAGE_INSUFFICIENT_RESOURCES_ERROR
} from '../../constants'

const executors = ({ senders }) => {
  const executionInstance = {}

  const executeArmyRecruitment = async () => {
    const {
      selectedVillage: { id, name, recruitmentInstructions: villageRecruitmentInstructions = [] },
      recruitmentInstructions: overallRecruitmentInstructions = [],
      currentRecruitmentInstructionIndex,
      playerVillagesLeft
    } = executionInstance
    // give priority to village recruitment
    let recruitmentInstructions = villageRecruitmentInstructions.length && villageRecruitmentInstructions
    if (!recruitmentInstructions) {
      recruitmentInstructions = overallRecruitmentInstructions.length && overallRecruitmentInstructions
    }

    if (!recruitmentInstructions) {
      return senders.close('Recruitment instructions not found! Please provide at least 1.')
    }

    const recruitmentInstruction = recruitmentInstructions[currentRecruitmentInstructionIndex]

    if (!recruitmentInstruction) {
      return senders.close(`No more recruitment instructions for village [${name}]`, { playerVillagesLeft })
    }

    const { amount, unitType } = recruitmentInstruction

    if (!amount || !unitType) {
      return senders.close(`Invalid instructions provided for village [${name}]`, { playerVillagesLeft })
    }

    // batch the requests so we don't overwhelm the server
    if (currentRecruitmentInstructionIndex % 3 === 0) await delay(roundRandomWithRange({ min: 1, max: 3 }) * 1000)

    console.log(`Recruiting from [${name}]: ${unitType} ${amount}
     Status: ${currentRecruitmentInstructionIndex + 1}/${recruitmentInstructions.length}`)

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
    [CHARACTER_INFO_TYPE_RECEIVE]: ({ response, config }) => {
      if (!config.isRecruit) return console.log('Not called for recruiting')
      const { playerVillageNamesToIgnore = [], playerVillagesToAllow = [], recruitmentInstructions = [] } = config

      let characterVillages = _.get(response, 'data.villages')

      executionInstance.playerVillageNamesToIgnore = executionInstance.playerVillageNamesToIgnore || playerVillageNamesToIgnore

      if (playerVillagesToAllow.length) {
        // preserve the order of allowed villages
        characterVillages = playerVillagesToAllow
          .map(({ name }) => characterVillages.find(village => village.name === name))
          .filter(Boolean)
      }

      if (executionInstance.playerVillageNamesToIgnore.length) {
        characterVillages = characterVillages.filter(({ name }) => !executionInstance.playerVillageNamesToIgnore.includes(name))
      }

      if (!characterVillages.length) {
        return senders.close('All villages are recruiting')
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
      const { selectedVillage: { id } } = executionInstance
      if (!id) return console.log(`Invalid id for ${BARRACKS_RECRUIT_JOB_CREATED_TYPE_RECEIVE}`)
      const jobId = _.get(response, 'data.job_id')
      const villageId = _.get(response, 'data.village_id')

      if (jobId && villageId === id) {
        executionInstance.currentRecruitmentInstructionIndex += 1
        return executeArmyRecruitment()
      }

      return senders.close('No more recruitment jobs')
    },
    [SYSTEM_ERROR_TYPE_RECEIVE]: ({ response }) => {
      const errorCause = _.get(response, 'data.cause')
      const errorCode = _.get(response, 'data.code')
      const { selectedVillage: { name } = {}, playerVillagesLeft } = executionInstance

      if (errorCause === BARRACKS_RECRUIT_TYPE_SEND && errorCode === VILLAGE_INSUFFICIENT_RESOURCES_ERROR) {
        senders.close(`Not enough resources for [${name}]. Either build farm or gather more resources`, { playerVillagesLeft })
        return
      }

      senders.close(`Error: ${errorCause};${errorCode}`)
    }
  })
}

export default executors

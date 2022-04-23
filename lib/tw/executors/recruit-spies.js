
// 3rd party modules
import _ from 'lodash'
import { delay } from 'promises-to-retry'

// local modules
import { roundRandomWithRange } from '#global-utils'
import {
  AUTH_LOGIN_SUCCESS_TYPE_RECEIVE,
  CHARACTER_INFO_TYPE_RECEIVE,
  SYSTEM_ERROR_TYPE_RECEIVE,
  AUTHENTICATION_CHARACTER_SELECTED_TYPE_RECEIVE,
  VILLAGES_DATA_TYPE_RECEIVE, SCOUTING_RECRUIT_TYPE_RECEIVE,
  MESSAGE_ERROR_TYPE_RECEIVE, UNMET_REQUIREMENTS_SPY_ERROR
} from '#global-constants'

const executors = ({ senders }) => {
  const executionInstance = {}

  const executeSpyRecruitment = async () => {
    const { spyRecruits, spyRecruitsIndex } = executionInstance

    const spyRecruit = spyRecruits[spyRecruitsIndex]

    if (!spyRecruit) {
      return senders.close('No more spy recruits')
    }

    // batch the requests so we don't overwhelm the server
    if (spyRecruitsIndex % 3 === 0) await delay(roundRandomWithRange({ min: 1, max: 3 }) * 1000)

    console.log(`Recruiting spy from [${spyRecruit.name}] at slot [${spyRecruit.slot}]
     Status: ${spyRecruitsIndex + 1}/${spyRecruits.length}`)

    senders.sendSpyRecruitData(spyRecruit)
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
      if (!config.isSpyRecruit) return console.log('Not called for spy recruiting')

      const characterVillages = _.get(response, 'data.villages')
      const villageIds = characterVillages.map(({ id }) => id)
      senders.sendGetVillagesData({ villageIds })
    },
    [VILLAGES_DATA_TYPE_RECEIVE]: ({ response, config }) => {
      const { maxRecruitSpies = 3, villagesToIgnore = [] } = config
      const spyRecruits = _.reduce(_.shuffle(response.data), (result, villageInfo) => {
        const spyInfo = _.get(villageInfo, 'Scouting/info')
        const village = _.get(villageInfo, 'Village/village')
        const tavernLevel = village.buildings.tavern.level

        if (villagesToIgnore.includes(village.name) || tavernLevel === 1) return result
        const spyRecruitsPerVillage = _.reduce(spyInfo, (slotResult, value, key) => {
          if (!key.includes('spy')) return slotResult
          const slot = parseInt(key.split('_')[1], 10)

          // if we reached the slot limit for the config,
          // or spy on this slot already exists, nothing to be done here
          if (Number.isNaN(slot) || slot > maxRecruitSpies || value) return slotResult
          return slotResult.concat({ villageId: village.villageId, name: village.name, slot })
        }, [])

        return result.concat(spyRecruitsPerVillage)
      }, [])

      Object.assign(executionInstance, { spyRecruits, spyRecruitsIndex: 0 })
      return executeSpyRecruitment()
    },
    [SCOUTING_RECRUIT_TYPE_RECEIVE]: ({ response }) => {
      const slot = _.get(response, 'data.slot')
      const villageId = _.get(response, 'data.village_id')

      if (slot && villageId) {
        executionInstance.spyRecruitsIndex += 1
        return executeSpyRecruitment()
      }

      return senders.close(`Something went wrong with ${SCOUTING_RECRUIT_TYPE_RECEIVE}`)
    },
    [SYSTEM_ERROR_TYPE_RECEIVE]: ({ response }) => {
      const errorCause = _.get(response, 'data.cause')
      const errorCode = _.get(response, 'data.code')
      executionInstance.spyRecruitsIndex += 1

      console.log(`Error: ${errorCause};${errorCode}`)
      return executeSpyRecruitment()
    },
    [MESSAGE_ERROR_TYPE_RECEIVE]: ({ response }) => {
      const errorCause = _.get(response, 'data.message')
      const errorCode = _.get(response, 'data.error_code')
      executionInstance.spyRecruitsIndex += 1

      if (errorCode === UNMET_REQUIREMENTS_SPY_ERROR) {
        return senders.close(`${errorCause}:${errorCode}`)
      }

      console.log(`Specific error: ${errorCause};${errorCode}`)
      return executeSpyRecruitment()
    }
  })
}

export default executors

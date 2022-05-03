// 3rd party modules
import _ from 'lodash'

// local modules
import {
  AUTH_LOGIN_SUCCESS_TYPE_RECEIVE,
  CHARACTER_INFO_TYPE_RECEIVE,
  SYSTEM_ERROR_TYPE_RECEIVE,
  AUTHENTICATION_CHARACTER_SELECTED_TYPE_RECEIVE,
  VILLAGES_DATA_TYPE_RECEIVE,
  MESSAGE_ERROR_TYPE_RECEIVE
} from '#global-constants'
import { delay } from 'promises-to-retry'
import { roundRandomWithRange } from '#global-utils'

const executors = ({ senders, emitterKey }) => {
  const executionInstance = {}

  function executeTradingResources () {
    senders.sendTradingResources({})
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
      senders.close('Character not found', { emitterKey })
    },
    [CHARACTER_INFO_TYPE_RECEIVE]: ({ response }) => {
      const characterVillages = _.get(response, 'data.villages')
      const villageIds = characterVillages.map(({ id }) => id)
      senders.sendGetVillagesData({ villageIds })
    },
    [VILLAGES_DATA_TYPE_RECEIVE]: ({ response, config }) => {
      const { test } = config
      // handle the villages sorting
      // Transport/list.transports
      /*
        character_id: 848897342
        merchant_amount: 10
        res_clay: 5522
        res_iron: 0
        res_wood: 4478
        start_village_id: 4189
        start_village_name: "(015) Augsburg"
        start_x: 557
        start_y: 481
        status: 0
        target_village_id: 3170
        target_village_name: "(017)x"
        target_x: 555
        target_y: 482
        time_completed: 1651582003
        time_start: 1651581051
        transport_id: 91839
        type: "transport"
      */
      return executeTradingResources()
    },
    [SYSTEM_ERROR_TYPE_RECEIVE]: ({ response }) => {
      if (!executionInstance.isTradingResources) return

      const errorCause = _.get(response, 'data.cause')
      const errorCode = _.get(response, 'data.code')

      console.log(`Error: ${errorCause};${errorCode}`)
      return executeTradingResources()
    },
    [MESSAGE_ERROR_TYPE_RECEIVE]: ({ response }) => {
      if (!executionInstance.isTradingResources) return

      const errorCause = _.get(response, 'data.message')
      const errorCode = _.get(response, 'data.error_code')

      console.log(`Error: ${errorCause};${errorCode}`)
      return executeTradingResources()
    }
  }
}

export default executors

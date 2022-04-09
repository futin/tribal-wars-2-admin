// node core modules

// 3rd party modules
import _ from 'lodash'

// local modules
import { toCamelCaseRecursive } from '../../utils'
import {
  AUTH_LOGIN_SUCCESS_TYPE_RECEIVE,
  CHARACTER_INFO_TYPE_RECEIVE,
  SYSTEM_ERROR_TYPE_RECEIVE,
  AUTHENTICATION_CHARACTER_SELECTED_TYPE_RECEIVE,
  VILLAGES_DATA_TYPE_RECEIVE,
  GAME_DATA_RECEIVE
} from '../../constants'

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
      const { villageName } = config
      const characterVillages = _.get(response, 'data.villages')

      const selectedVillage = characterVillages.find(village => village.name === villageName)
      if (!selectedVillage) return senders.close(`Village for the name [${villageName}] not found`)

      Object.assign(executionInstance, { selectedVillage })

      senders.sendGetGameData()
    },
    [GAME_DATA_RECEIVE]: ({ response }) => {
      const { selectedVillage } = executionInstance

      let allBuildingsInfo = _.get(response, 'data.GameData/buildings')
      allBuildingsInfo = toCamelCaseRecursive(allBuildingsInfo)

      const reducedBuildingInfo = _.reduce(allBuildingsInfo, (result, buildingInfo, buildingName) => {
        const { id, individualLevelCosts } = buildingInfo
        return { ...result, [buildingName]: { id, individualLevelCosts } }
      }, {})

      Object.assign(executionInstance, { reducedBuildingInfo })

      senders.sendGetVillagesData({ villageIds: [selectedVillage.id] })
    },
    [VILLAGES_DATA_TYPE_RECEIVE]: ({ response }) => {
      const { selectedVillage } = executionInstance
      let villageData = response.data[selectedVillage.id]
      if (!villageData) return senders.close(`Village not available for the id [${selectedVillage.id}]`)

      villageData = toCamelCaseRecursive(villageData)

      const resources = _.get(villageData, 'Village/village.resources')
      const village = _.get(villageData, 'Village/village')
      const { queue, unlockedSlots } = _.get(villageData, 'Building/queue')

      console.log('---', require('util').inspect({ resources, village, queue, unlockedSlots }, true, null))
      senders.close('Done')
    },
    [SYSTEM_ERROR_TYPE_RECEIVE]: ({ response }) => {
      const errorCause = _.get(response, 'data.cause')
      const errorCode = _.get(response, 'data.code')

      senders.close(`Error: ${errorCause};${errorCode}`)
    }
  })
}

export default executors

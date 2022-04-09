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

const buildingOrderMap = {
  RESOURCES: ['timberCamp', 'clayPit', 'ironMine', 'warehouse'],
  SECONDARY: ['hospital', 'tavern', 'statue', 'rallyPoint'],
  HEADQUARTER: ['headquarter'],
  BARRACKS: ['barracks'],
  FARM: ['farm'],
  WALL: ['wall']
}

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

      senders.sendGetVillagesData({ villageIds: [selectedVillage.id] })
    },
    [VILLAGES_DATA_TYPE_RECEIVE]: ({ response }) => {
      const { selectedVillage } = executionInstance
      let villageData = response.data[selectedVillage.id]
      if (!villageData) return senders.close(`Village not available for the id [${selectedVillage.id}]`)

      villageData = toCamelCaseRecursive(villageData)

      const resources = _.get(villageData, 'Village/village.resources')
      const villageBuildings = _.get(villageData, 'Village/village.buildings')
      let { queue, unlockedSlots } = _.get(villageData, 'Building/queue')
      queue = _.map(toCamelCaseRecursive(queue), elem => elem)

      const reducedVillageBuildings = _.reduce(villageBuildings, (result, buildingValue, buildingName) =>
        ({ ...result, [buildingName]: _.pick(buildingValue, ['level', 'requiredLevel']) }), {})

      if (queue.length === unlockedSlots) return senders.close(`There are no free slots for village [${selectedVillage.name}]`)

      Object.assign(executionInstance, { resources, queue, unlockedSlots, reducedVillageBuildings })
      senders.sendGetGameData()
    },
    [GAME_DATA_RECEIVE]: ({ response, config }) => {
      const { selectedVillage, resources, queue, unlockedSlots, reducedVillageBuildings } = executionInstance
      const { buildingOrder, buildingPriority } = config

      let allBuildingsInfo = _.get(response, 'data.GameData/buildings')
      allBuildingsInfo = toCamelCaseRecursive(allBuildingsInfo, { id: true })

      const headquarterLevel = reducedVillageBuildings.headquarter.level

      const buildingsWithNextLevelCost = _.reduce(reducedVillageBuildings, (result, villageBuilding, villageBuildingName) => {
        const { id, individualLevelCosts } = allBuildingsInfo[villageBuildingName]
        const { level, requiredLevel } = villageBuilding

        if (requiredLevel > headquarterLevel) {
          console.log({ requiredLevel, headquarterLevel })
          console.log(`required level of ${villageBuildingName} not high enough`)
          return result
        }

        const nextLevel = level + 1
        const nextLevelCost = individualLevelCosts[nextLevel]
        if (!nextLevelCost) {
          console.log(`Reached maximum for ${villageBuildingName}`)
          return result
        }

        return { ...result, [villageBuildingName]: { id, ...villageBuilding, nextLevelCost } }
      }, {})

      console.log('---', require('util').inspect({ resources, queue, unlockedSlots, buildingsWithNextLevelCost }, true, null))
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

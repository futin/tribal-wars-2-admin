// node core modules

// 3rd party modules
import _ from 'lodash'
import transform from 'oniyi-object-transform'

// local modules
import { roundRandomWithRange, toCamelCaseRecursive } from '../../utils'
import {
  AUTH_LOGIN_SUCCESS_TYPE_RECEIVE,
  CHARACTER_INFO_TYPE_RECEIVE,
  SYSTEM_ERROR_TYPE_RECEIVE,
  AUTHENTICATION_CHARACTER_SELECTED_TYPE_RECEIVE,
  VILLAGES_DATA_TYPE_RECEIVE,
  GAME_DATA_RECEIVE,
  BUILDING_UPGRADE_RECEIVE
} from '../../constants'
import { delay } from 'promises-to-retry'

const buildingOrderMap = {
  RESOURCES: ['timberCamp', 'clayPit', 'ironMine', 'warehouse'],
  SECONDARY: ['hospital', 'tavern', 'statue', 'rallyPoint'],
  HEADQUARTER: ['headquarter'],
  BARRACKS: ['barracks'],
  FARM: ['farm'],
  WALL: ['wall']
}

const buildingUpgradeSortByPriority = {
  RANDOM: (buildingUpgrades) => _.shuffle(buildingUpgrades),
  LOW_LEVEL: (buildingUpgrades) => buildingUpgrades.slice().sort((b1, b2) => b1.level - b2.level),
  CHEAP: (buildingUpgrades) => buildingUpgrades.slice().sort((b1, b2) => b1.nextLevelCost.totalResourcesCost - b2.nextLevelCost.totalResourcesCost),
  FAST: (buildingUpgrades) => buildingUpgrades.slice().sort((b1, b2) => b1.nextLevelCost.buildTime - b2.nextLevelCost.buildTime)
}

const findNextBuildingUpgradeQueue = (buildingUpgrades, availableResources) =>
  buildingUpgrades.find(buildingUpgrade =>
    _.every(availableResources, (resourceValue, resourceKey) =>
      resourceValue - buildingUpgrade[resourceKey] >= 0))

function calculateNextBuildingUpgradeQueue ({ availableResources, buildingsWithNextLevelCost, buildingOrder, buildingPriority = 'RANDOM' }) {
  const buildingUpgradesInfoInOrder = buildingOrder.reduce((result, buildingOrderType) => {
    const buildingIds = buildingOrderMap[buildingOrderType]
    return result.concat(buildingIds.map(buildingId => buildingsWithNextLevelCost[buildingId]).filter(Boolean))
  }, [])

  const buildingUpgradesSorted = buildingUpgradeSortByPriority[buildingPriority](buildingUpgradesInfoInOrder)
  const nextBuildingUpgrade = findNextBuildingUpgradeQueue(buildingUpgradesSorted, availableResources)

  return nextBuildingUpgrade?.id
}

const executors = ({ senders }) => {
  const executionInstance = {}

  async function prepareNextBuildingUpgradeQueue (config) {
    const { selectedVillage, queue, unlockedSlots, availableResources, buildingsWithNextLevelCost } = executionInstance

    if (queue.length === unlockedSlots) return senders.close(`There are no available slots for village [${selectedVillage.name}] (2)`)

    const nextBuildingUpgrade = calculateNextBuildingUpgradeQueue({ availableResources, buildingsWithNextLevelCost, ...config })
    if (!nextBuildingUpgrade) return senders.close(`Not able to calculate the next building upgrade for village [${selectedVillage.name}]`)

    await delay(roundRandomWithRange({ min: 2, max: 5 }) * 1000)
    senders.senBuildingUpgrade({ villageId: selectedVillage.id, building: nextBuildingUpgrade })
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

      const availableResources = _.get(villageData, 'Village/village.availableResources')
      const villageBuildings = _.get(villageData, 'Village/village.buildings')
      let { queue, unlockedSlots } = _.get(villageData, 'Building/queue')
      queue = _.map((queue), ({ building }) => ({ building }))

      const reducedVillageBuildings = _.reduce(villageBuildings, (result, buildingValue, buildingName) =>
        ({ ...result, [buildingName]: _.pick(buildingValue, ['level', 'requiredLevel']) }), {})

      if (queue.length === unlockedSlots) return senders.close(`There are no available slots for village [${selectedVillage.name}]`)

      Object.assign(executionInstance, { availableResources, queue, unlockedSlots, reducedVillageBuildings })
      senders.sendGetGameData()
    },
    [GAME_DATA_RECEIVE]: ({ response, config }) => {
      const { reducedVillageBuildings } = executionInstance

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
        let nextLevelCost = individualLevelCosts[nextLevel]
        if (!nextLevelCost) {
          console.log(`Reached maximum for ${villageBuildingName}`)
          return result
        }

        nextLevelCost = transform({
          src: nextLevelCost,
          pick: ['wood', 'clay', 'iron', 'buildTime', 'food'],
          parse: { wood: parseInt, clay: parseInt, iron: parseInt, buildTime: parseInt, food: parseInt }
        })
        const { wood, clay, iron } = nextLevelCost

        nextLevelCost.totalResourcesCost = wood + clay + iron
        return { ...result, [villageBuildingName]: { id, level, nextLevelCost } }
      }, {})

      Object.assign(executionInstance, { buildingsWithNextLevelCost })

      prepareNextBuildingUpgradeQueue(config)
    },
    [BUILDING_UPGRADE_RECEIVE]: ({ response, config }) => {
      const { selectedVillage } = executionInstance
      const building = _.get(response, 'data.job.building')
      const villageId = _.get(response, 'data.village_id')

      if (building && villageId === selectedVillage.id) {
        executionInstance.queue.push({ building })
        return prepareNextBuildingUpgradeQueue(config)
      }
    },
    [SYSTEM_ERROR_TYPE_RECEIVE]: ({ response }) => {
      const errorCause = _.get(response, 'data.cause')
      const errorCode = _.get(response, 'data.code')

      senders.close(`Error: ${errorCause};${errorCode}`)
    }
  })
}

export default executors

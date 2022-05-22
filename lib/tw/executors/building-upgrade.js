// node core modules

// 3rd party modules
import _ from 'lodash'
import transform from 'oniyi-object-transform'

// local modules
import { roundRandomWithRange, toCamelCaseRecursive } from '#global-utils'
import {
  CHARACTER_INFO_TYPE_RECEIVE,
  SYSTEM_ERROR_TYPE_RECEIVE,
  AUTHENTICATION_CHARACTER_SELECTED_TYPE_RECEIVE,
  VILLAGES_DATA_TYPE_RECEIVE,
  GAME_DATA_RECEIVE,
  BUILDING_UPGRADE_RECEIVE
} from '#global-constants'
import { delay } from 'promises-to-retry'

const buildingCommandMap = {
  RESOURCES: ['timberCamp', 'clayPit', 'ironMine', 'warehouse'],
  SECONDARY: ['hospital', 'tavern', 'market'],
  STATUE: ['statue'],
  RALLY_POINT: ['rallyPoint'],
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
      resourceValue - buildingUpgrade.nextLevelCost[resourceKey] >= 0))

function calculateNextBuildingUpgradeQueue ({ availableResources, buildingsWithNextLevelCost, buildingCommands, buildingPriority = 'RANDOM' }) {
  const buildingUpgradesInfoInOrder = buildingCommands.reduce((result, buildingCommandType) => {
    const buildingIds = buildingCommandMap[buildingCommandType]
    return result.concat(buildingIds.map(buildingId => buildingsWithNextLevelCost[buildingId]).filter(Boolean))
  }, [])

  const buildingUpgradesSorted = buildingUpgradeSortByPriority[buildingPriority](buildingUpgradesInfoInOrder)

  return findNextBuildingUpgradeQueue(buildingUpgradesSorted, availableResources)
}

const executors = ({ senders, emitterKey }) => {
  const executionInstance = {}
  const ERROR_RESPONSE = { emitterKey, isError: true }

  async function prepareNextBuildingUpgradeQueue (config) {
    const { selectedVillage: { id, name }, queue, unlockedSlots, availableResources, buildingsWithNextLevelCost } = executionInstance

    if (queue.length === unlockedSlots) {
      return senders.close(`There are no available slots for village [${name}] (2)`, { emitterKey, emitterPayload: { queue } })
    }

    const nextBuildingUpgrade = calculateNextBuildingUpgradeQueue({ availableResources, buildingsWithNextLevelCost, ...config })
    if (!nextBuildingUpgrade) {
      return senders.close(`There are no available building upgrades for village [${name}]`, { emitterKey, emitterPayload: { queue } })
    }

    await delay(roundRandomWithRange({ min: 2, max: 5 }) * 1000)

    console.log(`Setting build upgrade from [${name}]: 
     Building upgrade info: id => ${nextBuildingUpgrade.id}, toLevel => ${nextBuildingUpgrade.level}
     Status: ${queue.length + 1} / ${unlockedSlots}`)

    senders.senBuildingUpgrade({ villageId: id, building: nextBuildingUpgrade.id })
  }

  return ({
    [AUTHENTICATION_CHARACTER_SELECTED_TYPE_RECEIVE]: ({ response }) => {
      const ownerId = _.get(response, 'data.owner_id')
      if (ownerId) return senders.sendGetCharacterInfo()
      senders.close('Character not found', ERROR_RESPONSE)
    },
    [CHARACTER_INFO_TYPE_RECEIVE]: ({ response, config }) => {
      if (!config.isBuildingUpgrades) return console.log('Not called for building')
      const { villageName } = config
      const characterVillages = _.get(response, 'data.villages')

      const selectedVillage = characterVillages.find(village => village.name === villageName)
      if (!selectedVillage) return senders.close(`Village for the name [${villageName}] not found`, ERROR_RESPONSE)

      Object.assign(executionInstance, { selectedVillage })

      senders.sendGetVillagesData({ villageIds: [selectedVillage.id] })
    },
    [VILLAGES_DATA_TYPE_RECEIVE]: ({ response }) => {
      const { selectedVillage } = executionInstance
      let villageData = response.data[selectedVillage.id]
      if (!villageData) return senders.close(`Village not available for the id [${selectedVillage.id}]`, ERROR_RESPONSE)

      villageData = toCamelCaseRecursive(villageData)

      const availableResources = _.get(villageData, 'Village/village.resources')
      const villageBuildings = _.get(villageData, 'Village/village.buildings')
      let { queue, unlockedSlots } = _.get(villageData, 'Building/queue')
      queue = _.map(queue)

      const reducedVillageBuildings = _.reduce(villageBuildings, (result, buildingValue, buildingName) =>
        ({ ...result, [buildingName]: _.pick(buildingValue, ['level', 'requiredLevel']) }), {})

      if (queue.length === unlockedSlots) {
        return senders.close(`There are no available slots for village [${selectedVillage.name}]`, { emitterKey, emitterPayload: { queue } })
      }

      Object.assign(executionInstance, { availableResources, queue, unlockedSlots, reducedVillageBuildings })
      senders.sendGetGameData()
    },
    [GAME_DATA_RECEIVE]: ({ response, config }) => {
      const { reducedVillageBuildings, queue } = executionInstance
      const { maxLevelPerBuildingName = {} } = config

      const buildingUpgradesInQueueWithHighestLevel = queue.reduce((result, { building, level }) => {
        result[building] = Math.max(result[building]?.level || 0, level)
        return result
      }, {})

      let allBuildingsInfo = _.get(response, 'data.GameData/buildings')
      allBuildingsInfo = toCamelCaseRecursive(allBuildingsInfo, { id: true })

      const headquarterLevel = reducedVillageBuildings.headquarter.level

      const buildingsWithNextLevelCost = _.reduce(reducedVillageBuildings, (result, villageBuilding, villageBuildingName) => {
        const { id, individualLevelCosts } = allBuildingsInfo[villageBuildingName]
        const { level: currentLevel, requiredLevel } = villageBuilding
        if (requiredLevel > headquarterLevel) return result

        const maxLevelAllowed = maxLevelPerBuildingName[villageBuildingName]

        const queueLevel = buildingUpgradesInQueueWithHighestLevel[villageBuildingName]
        const level = queueLevel || currentLevel

        const nextLevel = level + 1
        let nextLevelCost = individualLevelCosts[nextLevel]
        if (!nextLevelCost) return result
        if (maxLevelAllowed && maxLevelAllowed < nextLevel) return result

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
    [BUILDING_UPGRADE_RECEIVE]: ({ response }) => {
      const { selectedVillage } = executionInstance
      const building = _.get(response, 'data.job.building')
      const villageId = _.get(response, 'data.village_id')

      if (building && villageId === selectedVillage.id) {
        return senders.sendGetVillagesData({ villageIds: [selectedVillage.id] })
      }
    },
    [SYSTEM_ERROR_TYPE_RECEIVE]: ({ response }) => {
      const { queue } = executionInstance

      const errorCause = _.get(response, 'data.cause')
      const errorCode = _.get(response, 'data.code')

      senders.close(`Error: ${errorCause};${errorCode}`, { emitterKey, emitterPayload: { queue } })
    }
  })
}

export default executors

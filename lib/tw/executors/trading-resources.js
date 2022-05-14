// 3rd party modules
import _ from 'lodash'

// local modules
import {
  AUTH_LOGIN_SUCCESS_TYPE_RECEIVE,
  CHARACTER_INFO_TYPE_RECEIVE,
  SYSTEM_ERROR_TYPE_RECEIVE,
  AUTHENTICATION_CHARACTER_SELECTED_TYPE_RECEIVE,
  VILLAGES_DATA_TYPE_RECEIVE,
  TRADING_MERCHANT_STATUS_RECEIVE,
  MESSAGE_ERROR_TYPE_RECEIVE
} from '#global-constants'
import { deepLog } from '#global-utils'

/*
 -- Transport/list.transports --
  const transports = _.get(villageInfo, 'Transport/list.transports')

SENDING TO
  character_id: 848897342
  merchant_amount: 2
  res_clay: 0
  res_iron: 0
  res_wood: 1175
  start_village_id: 5897
  start_village_name: "(001)x"
  start_x: 559
  start_y: 459
  status: 0
  target_village_id: 6599
  target_village_name: "(002)x"
  target_x: 561
  target_y: 459
  time_completed: 1651915579
  time_start: 1651914859
  transport_id: 95372
  type: "transport"
SENDING FROM
  time_completed: 1651916299
  time_start: 1651915579
  type: "return"
*/

function splitVillagesByAvailability (allVillagesData, config) {
  const {
    sourceVillageAvailableResourcesRichThresholdInPercent,
    sourceVillageAvailableResourcesThresholdInPercent,
    targetVillageAvailableResourcesPoorThresholdInPercent,
    targetVillageAvailableResourcesThresholdInPercent,
    sourceVillageNamesToIgnore = [],
    targetVillageNamesToIgnore = []
  } = config

  const villagesWithAvailableResources = _.reduce(allVillagesData, (result, villageInfo) => {
    let availableResources = _.get(villageInfo, 'Village/village.resources')
    availableResources = _.pick(availableResources, ['wood', 'clay', 'iron'])
    const village = _.get(villageInfo, 'Village/village')

    const { villageId: id, name, x, y, storage } = village
    const resourcesWithAvailablePercentage = _.reduce(availableResources, (resourcesResult, resourceCount, resourceType) => {
      const availablePercentage = Math.floor(resourceCount / storage * 100)
      resourcesResult.availablePercentagesList.push(availablePercentage)

      return {
        ...resourcesResult,
        [resourceType]: resourceCount,
        [`${resourceType}AvailablePercentage`]: availablePercentage
      }
    }, { availablePercentagesList: [] })

    _.set(result, id, { id, name, x, y, storage, ...resourcesWithAvailablePercentage })

    return result
  }, {})

  const allIncludedVillages = []

  const richSourceVillages = _
    .filter(villagesWithAvailableResources, ({ availablePercentagesList }) =>
      availablePercentagesList.some(availablePercentage =>
        availablePercentage >= sourceVillageAvailableResourcesRichThresholdInPercent))
    .filter(({ name }) => !sourceVillageNamesToIgnore.includes(name))
    .map(village => ({ ...village, withPriority: true }))
  allIncludedVillages.push(...richSourceVillages)

  const normalSourceVillages = _
    .filter(villagesWithAvailableResources, ({ availablePercentagesList, name }) =>
      availablePercentagesList.some(availablePercentage =>
        availablePercentage >= sourceVillageAvailableResourcesThresholdInPercent) &&
      !allIncludedVillages.find(village => village.name === name))
    .filter(({ name }) => !sourceVillageNamesToIgnore.includes(name))
  allIncludedVillages.push(...normalSourceVillages)

  const allSourceVillages = richSourceVillages.concat(normalSourceVillages)

  const poorTargetVillages = _
    .filter(villagesWithAvailableResources, ({ availablePercentagesList, name }) =>
      availablePercentagesList.some(availablePercentage =>
        availablePercentage <= targetVillageAvailableResourcesPoorThresholdInPercent) &&
    !allIncludedVillages.find(village => village.name === name))
    .filter(({ name }) => !targetVillageNamesToIgnore.includes(name))
    .map(village => ({ ...village, withPriority: true }))

  allIncludedVillages.push(...poorTargetVillages)

  const normalTargetVillages = _
    .filter(villagesWithAvailableResources, ({ availablePercentagesList, name }) =>
      availablePercentagesList.some(availablePercentage =>
        availablePercentage <= targetVillageAvailableResourcesThresholdInPercent) &&
      !allIncludedVillages.find(village => village.name === name))
    .filter(({ name }) => !targetVillageNamesToIgnore.includes(name))

  const allTargetVillages = poorTargetVillages.concat(normalTargetVillages)

  return {
    richSourceVillages,
    normalSourceVillages,
    allSourceVillages,
    poorTargetVillages,
    normalTargetVillages,
    allTargetVillages
  }
}

function calculateDistancesBetweenSourcesAndTargets ({ allSourceVillages, allTargetVillages }) {
  // calculate distances for all source villages from target villages
  const allSourcesVillagesWithDistances = allSourceVillages
    .map(sourceVillage => {
      const { x: sourceX, y: sourceY } = sourceVillage
      const targetsWithDistance = []

      allTargetVillages.forEach(targetVillage => {
        const { id, name, x: targetX, y: targetY } = targetVillage
        const absoluteDistance = Math.abs(sourceX - targetX) + Math.abs(sourceY - targetY)
        targetsWithDistance.push({ id, name, absoluteDistance })
      })
      sourceVillage.targetsWithDistance = targetsWithDistance.sort((t1, t2) => t1.absoluteDistance - t2.absoluteDistance)

      return sourceVillage
    })
    .sort((sourceVillage) => sourceVillage.withPriority)

  // then calculate distances for all target villages from source villages
  const allTargetVillagesWithDistances = allTargetVillages
    .map(targetVillage => {
      const { x: targetX, y: targetY } = targetVillage
      const targetsWithDistance = []

      allSourceVillages.forEach(sourceVillage => {
        const { id, name, x: sourceX, y: sourceY } = sourceVillage
        const absoluteDistance = Math.abs(targetX - sourceX) + Math.abs(targetY - sourceY)
        targetsWithDistance.push({ id, name, absoluteDistance })
      })
      targetVillage.targetsWithDistance = targetsWithDistance.sort((t1, t2) => t1.absoluteDistance - t2.absoluteDistance)

      return targetVillage
    })
    .sort((targetVillage) => targetVillage.withPriority)

  return { allSourcesVillagesWithDistances, allTargetVillagesWithDistances }
}

const executors = ({ senders, emitterKey }) => {
  const executionInstance = {}

  function executeTradingResources () {
    senders.sendTradingResources({})
  }

  function prepareTradingResources () {
    const { allSourcesVillagesWithDistances, allTargetVillagesWithDistances } = calculateDistancesBetweenSourcesAndTargets(executionInstance)
    deepLog({ label: '---', value: { allSourcesVillagesWithDistances, allTargetVillagesWithDistances } })
    senders.close('11')
  }

  function updateSourceVillagesMerchantStatus () {
    const { allSourceVillages, sourceVillageIndex = 0 } = executionInstance
    const sourceVillage = allSourceVillages[sourceVillageIndex]
    if (!sourceVillage) {
      console.log('All source villages are updated')
      return prepareTradingResources()
    }

    executionInstance.sourceVillageIndex = sourceVillageIndex + 1

    return senders.sendGetMerchantStatus({ villageId: sourceVillage.id })
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
      const allVillages = splitVillagesByAvailability(response.data, config)

      Object.assign(executionInstance, allVillages)

      return updateSourceVillagesMerchantStatus()
    },
    [TRADING_MERCHANT_STATUS_RECEIVE]: ({ response, config }) => {
      const { data: { free, total, village_id: villageId } } = response
      const { maxTransportsToUseInPercent } = config
      const { allSourceVillages } = executionInstance

      const allowedMerchantsToUse = Math.ceil((total * maxTransportsToUseInPercent) / 100)
      const availableMerchants = Math.min(allowedMerchantsToUse, free)

      // use the power of JS to update the references of source villages
      const sourceVillage = allSourceVillages.find(({ id }) => id === villageId)
      _.set(sourceVillage, 'availableMerchants', availableMerchants)

      return updateSourceVillagesMerchantStatus()
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

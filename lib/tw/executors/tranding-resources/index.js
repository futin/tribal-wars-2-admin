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
import { deepLog, roundRandomWithRange } from '#global-utils'
import { VillagesHandler } from './villages-handler.js'
import { delay } from 'promises-to-retry'

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
    .map(village => ({ ...village, withPriority: true, isSource: true }))
  allIncludedVillages.push(...richSourceVillages)

  const normalSourceVillages = _
    .filter(villagesWithAvailableResources, ({ availablePercentagesList, name }) =>
      availablePercentagesList.some(availablePercentage =>
        availablePercentage >= sourceVillageAvailableResourcesThresholdInPercent) &&
      !allIncludedVillages.find(village => village.name === name))
    .filter(({ name }) => !sourceVillageNamesToIgnore.includes(name))
    .map(village => ({ ...village, isSource: true }))

  allIncludedVillages.push(...normalSourceVillages)

  const allSourceVillages = richSourceVillages.concat(normalSourceVillages)

  const poorTargetVillages = _
    .filter(villagesWithAvailableResources, ({ availablePercentagesList, name }) =>
      availablePercentagesList.some(availablePercentage =>
        availablePercentage <= targetVillageAvailableResourcesPoorThresholdInPercent) &&
    !allIncludedVillages.find(village => village.name === name))
    .filter(({ name }) => !targetVillageNamesToIgnore.includes(name))
    .map(village => ({ ...village, withPriority: true, isTarget: true }))

  allIncludedVillages.push(...poorTargetVillages)

  const normalTargetVillages = _
    .filter(villagesWithAvailableResources, ({ availablePercentagesList, name }) =>
      availablePercentagesList.some(availablePercentage =>
        availablePercentage <= targetVillageAvailableResourcesThresholdInPercent) &&
      !allIncludedVillages.find(village => village.name === name))
    .filter(({ name }) => !targetVillageNamesToIgnore.includes(name))
    .map(village => ({ ...village, isTarget: true }))

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
      const { x: sourceX, y: sourceY, availableMerchants } = sourceVillage
      if (!availableMerchants) return null

      const targetsWithDistance = []

      allTargetVillages.forEach(targetVillage => {
        const { id, name, x: targetX, y: targetY } = targetVillage
        const absoluteDistance = Math.abs(sourceX - targetX) + Math.abs(sourceY - targetY)
        targetsWithDistance.push({ id, name, absoluteDistance })
      })
      sourceVillage.targetsWithDistance = targetsWithDistance.sort((t1, t2) => t1.absoluteDistance - t2.absoluteDistance)

      return sourceVillage
    })
    .filter(Boolean)
    .sort((sourceVillage) => sourceVillage.withPriority)

  // then calculate distances for all target villages from source villages
  const allTargetVillagesWithDistances = allTargetVillages
    .map(targetVillage => {
      const { x: targetX, y: targetY } = targetVillage
      const sourcesWithDistance = []

      allSourceVillages.forEach(sourceVillage => {
        const { id, name, x: sourceX, y: sourceY } = sourceVillage
        const absoluteDistance = Math.abs(targetX - sourceX) + Math.abs(targetY - sourceY)
        sourcesWithDistance.push({ id, name, absoluteDistance })
      })
      targetVillage.sourcesWithDistance = sourcesWithDistance.sort((t1, t2) => t1.absoluteDistance - t2.absoluteDistance)

      return targetVillage
    })
    .sort((targetVillage) => targetVillage.withPriority)

  const allVillagesByPriority = allSourcesVillagesWithDistances
    .concat(allTargetVillagesWithDistances)
    .sort((village) => village.withPriority)

  return { allVillagesByPriority, allSourcesVillagesWithDistances, allTargetVillagesWithDistances }
}

const executors = ({ senders, emitterKey }) => {
  const executionInstance = {}

  async function executeTradingResources (allTradings) {
    for (let i = 0; i < allTradings.length; i++) {
      const tradingOperation = allTradings[i]
      const { sourceId, sourceName, targetId, targetName, tradingPlan } = tradingOperation
      await delay(roundRandomWithRange({ min: 1, max: 3 }) * 1000)
      console.log(`Trading from [${sourceName}] to [${targetName}]
     Trading plan: ${tradingPlan}
     Status: ${i + 1}/${allTradings.length}`)

      senders.sendTradingResources({ sourceVillageId: sourceId, targetVillageId: targetId, ...tradingPlan })
    }

    return senders.close('Done')
  }

  function prepareTradingResources (config) {
    const { allVillagesByPriority } = calculateDistancesBetweenSourcesAndTargets(executionInstance)
    const VillageHandler = new VillagesHandler({ villages: allVillagesByPriority, config })

    // deepLog({ label: 'allVillagesByPriority', value: allVillagesByPriority })

    const allTradings = allVillagesByPriority
      .reduce((result, { id, isSource, isTarget }) => {
        if (isSource) return result.concat(VillageHandler.prepareNextTradingsBySource({ sourceId: id }))
        if (isTarget) return result.concat(VillageHandler.prepareNextTradingsByTarget({ targetId: id }))
        return result
      }, [])
      .filter(Boolean)

    // deepLog({ label: 'allVillagesByPriority AFTER', value: allVillagesByPriority })
    // deepLog({ label: 'FINAL', value: allTradings })

    return executeTradingResources(allTradings)
  }

  function updateSourceVillagesMerchantStatus (config) {
    const { allSourceVillages, sourceVillageIndex = 0 } = executionInstance
    const sourceVillage = allSourceVillages[sourceVillageIndex]
    if (!sourceVillage) {
      console.log('All source villages are updated')
      return prepareTradingResources(config)
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

      return updateSourceVillagesMerchantStatus(config)
    },
    [TRADING_MERCHANT_STATUS_RECEIVE]: ({ response, config }) => {
      const { data: { free, total, village_id: villageId } } = response
      const { maxTransportsToUseInPercent } = config
      const { allSourceVillages } = executionInstance

      const allowedMerchantsToUse = Math.ceil((total * maxTransportsToUseInPercent) / 100)
      const availableMerchants = Math.min(allowedMerchantsToUse, free)

      // use the power of JS to update the references of source villages
      const sourceVillage = allSourceVillages.find(({ id }) => id === villageId)

      // if there are no available merchants, remove the source from the list
      if (availableMerchants > 0) _.set(sourceVillage, 'availableMerchants', availableMerchants)

      return updateSourceVillagesMerchantStatus(config)
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

// 3rd party modules
import _ from 'lodash'

// local modules

export function splitVillagesByAvailability (allVillagesData, config) {
  const {
    sourceVillageAvailableResourcesRichThresholdInPercent,
    sourceVillageAvailableResourcesThresholdInPercent,
    targetVillageAvailableResourcesPoorThresholdInPercent,
    targetVillageAvailableResourcesThresholdInPercent,
    sourceVillageNamesToIgnore = [],
    targetVillageNamesToIgnore = []
  } = config

  const allCurrentTransportsByTargetVillageId = _.reduce(allVillagesData, (result, villageInfo) => {
    let transports = _.get(villageInfo, 'Transport/list.transports', [])

    // we are only interested in ongoing transports (resources have not been delivered yet)
    transports = transports.filter(({ type }) => type === 'transport')

    if (!transports.length) return result

    transports.forEach(({ res_wood: wood, res_clay: clay, res_iron: iron, target_village_id: targetId }) => {
      if (!result[targetId]) result[targetId] = { wood: 0, clay: 0, iron: 0 }
      result[targetId].wood += wood
      result[targetId].clay += clay
      result[targetId].iron += iron
    })
    return result
  }, {})

  const villagesWithAvailableResources = _.reduce(allVillagesData, (result, villageInfo) => {
    let availableResources = _.get(villageInfo, 'Village/village.resources')
    availableResources = _.pick(availableResources, ['wood', 'clay', 'iron'])
    const village = _.get(villageInfo, 'Village/village')

    const { villageId: id, name, x, y, storage } = village
    const upcomingResourcesByTransport = allCurrentTransportsByTargetVillageId[id]

    if (upcomingResourcesByTransport) {
      availableResources.wood += upcomingResourcesByTransport.wood
      availableResources.clay += upcomingResourcesByTransport.clay
      availableResources.iron += upcomingResourcesByTransport.iron
    }

    const resourcesWithAvailablePercentage = _.reduce(availableResources, (resourcesResult, resourceAmount, resourceType) => {
      const availablePercentage = Math.floor(resourceAmount / storage * 100)
      resourcesResult.availablePercentagesList.push(availablePercentage)

      return {
        ...resourcesResult,
        [resourceType]: resourceAmount,
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
        availablePercentage > sourceVillageAvailableResourcesThresholdInPercent) &&
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
        availablePercentage < targetVillageAvailableResourcesThresholdInPercent) &&
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
    allTargetVillages,
    allCurrentTransportsByTargetVillageId
  }
}

export function calculateDistancesBetweenSourcesAndTargets ({ allSourceVillages, allTargetVillages }) {
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

  const allVillagesByPriority = allSourcesVillagesWithDistances
    .concat(allTargetVillagesWithDistances)
    .sort((village) => village.withPriority)

  return { allVillagesByPriority, allSourcesVillagesWithDistances, allTargetVillagesWithDistances }
}

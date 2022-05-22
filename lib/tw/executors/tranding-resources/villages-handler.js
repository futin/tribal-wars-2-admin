export function VillagesHandler ({ villages, config }) {
  this.villages = villages
  this.config = config || {}
  this.villagesByName = villages.reduce((result, village) => ({ ...result, [village.name]: village }), {})
  this.villagesById = villages.reduce((result, village) => ({ ...result, [village.id]: village }), {})
}

/* ---------------- GET ---------------- */

VillagesHandler.prototype.getVillage = function getVillage ({ id, name }) {
  if (id) return this.villagesById[id]
  return this.villagesByName[name]
}

VillagesHandler.prototype.buildOnEdgeTradingPlan = function buildOnEdgeTradingPlan ({ sourceVillage, targetId }) {
  const orderOfResources = ['wood', 'clay', 'iron']
  const merchantsUsed = 0
  let isValidTradingPlan

  const { id: sourceId, availableMerchants } = sourceVillage

  const tradingPlan = {
    wood: 0,
    clay: 0,
    iron: 0
  }

  // TODO: Implement on edge algorithm
}

VillagesHandler.prototype.buildBalancedTradingPlan = function buildBalancedTradingPlan ({ sourceVillage, targetId }) {
  const orderOfResources = ['wood', 'clay', 'iron']
  let merchantsUsed = 0
  let isValidTradingPlan

  const { id: sourceId, availableMerchants } = sourceVillage

  const tradingPlan = {
    wood: 0,
    clay: 0,
    iron: 0
  }
  while (merchantsUsed < availableMerchants) {
    // if there are no more resources to trade, exit the loop
    if (!orderOfResources.length) break

    const nextResourceIndex = merchantsUsed % orderOfResources.length
    const nextResource = orderOfResources[nextResourceIndex]
    const { errorsList: errorsListSource } = this.updateSourceVillage({ sourceId, [`${nextResource}Changed`]: 1000, merchantsUsed: 1 })

    // if there was an error with the source village, remove this resource from the order list
    // and try with other resources
    if (errorsListSource) {
      orderOfResources.splice(nextResourceIndex, 1)
      continue
    }

    const { errorsList: errorsListTarget } = this.updateTargetVillage({ targetId, [`${nextResource}Changed`]: 1000 })

    // if there was an error with the target village, remove this resource from the order list, revert resources
    // in the source village (since they are not used) and try with other resources
    if (errorsListTarget) {
      this.updateSourceVillage({ sourceId, [`${nextResource}Changed`]: -1000, merchantsUsed: -1 })
      orderOfResources.splice(nextResourceIndex, 1)
      continue
    }

    isValidTradingPlan = true
    tradingPlan[nextResource] += 1000
    merchantsUsed += 1
  }

  return isValidTradingPlan && tradingPlan
}

VillagesHandler.prototype.prepareTradingPlan = function prepareTradingPlan ({ sourceId, targetId }) {
  const { tradingOrder } = this.config
  const sourceVillage = this.getVillage({ id: sourceId })
  if (!sourceVillage) return

  if (tradingOrder === 'BALANCED') return this.buildBalancedTradingPlan({ sourceVillage, targetId })
  if (tradingOrder === 'ON_EDGE_FIRST') return this.buildOnEdgeTradingPlan({ sourceVillage, targetId })
}

VillagesHandler.prototype.prepareNextTradingsBySource = function prepareNextTradingsBySource ({ sourceId, sourceName }) {
  const sourceVillage = this.getVillage({ id: sourceId, name: sourceName })
  if (!sourceVillage) return

  const { id, targetsWithDistance } = sourceVillage

  return targetsWithDistance
    .map(({ id: targetId, name: targetName }) => {
      const isEligible = this.isSourceVillageEligible({ sourceId: id })
      if (!isEligible) return null

      const target = this.isTargetVillageEligible({ targetId })
      if (!target) return null

      const tradingPlan = this.prepareTradingPlan({ sourceId: id, targetId })
      if (!tradingPlan) return null

      return { sourceId: id, sourceName: sourceVillage.name, targetId, targetName, tradingPlan }
    })
    .filter(Boolean)
}

VillagesHandler.prototype.prepareNextTradingsByTarget = function prepareNextTradingsByTarget ({ targetId, targetName }) {
  const targetVillage = this.getVillage({ id: targetId, name: targetName })
  if (!targetVillage) return

  const { id, sourcesWithDistance } = targetVillage

  return sourcesWithDistance
    .map(({ id: sourceId, name: sourceName }) => {
      const target = this.isTargetVillageEligible({ targetId: id })
      if (!target) return null

      const isEligible = this.isSourceVillageEligible({ sourceId })
      if (!isEligible) return null

      const tradingPlan = this.prepareTradingPlan({ sourceId, targetId: id })
      if (!tradingPlan) return null

      return { sourceId, sourceName, targetId: targetVillage.id, targetName: targetVillage.name, tradingPlan }
    })
    .filter(Boolean)
}

/* ---------------- UPDATE ---------------- */

VillagesHandler.prototype.updateSourceVillage = function updateSourceVillage ({ sourceId, woodChanged = 0, clayChanged = 0, ironChanged = 0, merchantsUsed = 0 }) {
  const { sourceVillageAvailableResourcesThresholdInPercent } = this.config

  const sourceVillage = this.getVillage({ id: sourceId })
  if (!sourceVillage) return

  const { wood, clay, iron, availableMerchants, storage } = sourceVillage
  const newWood = wood - woodChanged
  const newClay = clay - clayChanged
  const newIron = iron - ironChanged
  const newAvailableMerchants = availableMerchants - merchantsUsed
  const newWoodAvailablePercentage = Math.floor(newWood / storage * 100)
  const newClayAvailablePercentage = Math.floor(newClay / storage * 100)
  const newIronAvailablePercentage = Math.floor(newIron / storage * 100)
  const errorsList = []

  if (woodChanged && newWoodAvailablePercentage < sourceVillageAvailableResourcesThresholdInPercent) errorsList.push('wood')
  if (clayChanged && newClayAvailablePercentage < sourceVillageAvailableResourcesThresholdInPercent) errorsList.push('clay')
  if (ironChanged && newIronAvailablePercentage < sourceVillageAvailableResourcesThresholdInPercent) errorsList.push('iron')

  // console.log({
  //   type: 'SOURCE',
  //   sourceId,
  //   woodChanged,
  //   newWoodAvailablePercentage,
  //   clayChanged,
  //   newClayAvailablePercentage,
  //   ironChanged,
  //   newIronAvailablePercentage
  // })

  if (errorsList.length) return { errorsList }

  Object.assign(sourceVillage, {
    wood: newWood,
    clay: newClay,
    iron: newIron,
    availableMerchants: newAvailableMerchants,
    woodAvailablePercentage: newWoodAvailablePercentage,
    clayAvailablePercentage: newClayAvailablePercentage,
    ironAvailablePercentage: newIronAvailablePercentage,
    availablePercentagesList: [newWoodAvailablePercentage, newClayAvailablePercentage, newIronAvailablePercentage]
  })

  return { sourceVillage }
}

VillagesHandler.prototype.updateTargetVillage = function updateTargetVillage ({ targetId, woodChanged = 0, clayChanged = 0, ironChanged = 0 }) {
  const { targetVillageAvailableResourcesThresholdInPercent } = this.config

  const targetVillage = this.getVillage({ id: targetId })
  if (!targetVillage) return

  const { wood, clay, iron, storage } = targetVillage
  const newWood = wood + woodChanged
  const newClay = clay + clayChanged
  const newIron = iron + ironChanged
  const newWoodAvailablePercentage = Math.floor(newWood / storage * 100)
  const newClayAvailablePercentage = Math.floor(newClay / storage * 100)
  const newIronAvailablePercentage = Math.floor(newIron / storage * 100)
  const errorsList = []

  // console.log({
  //   type: 'TARGET',
  //   targetId,
  //   woodChanged,
  //   newWoodAvailablePercentage,
  //   clayChanged,
  //   newClayAvailablePercentage,
  //   ironChanged,
  //   newIronAvailablePercentage
  // })
  if (woodChanged && newWoodAvailablePercentage > targetVillageAvailableResourcesThresholdInPercent) errorsList.push('wood')
  if (clayChanged && newClayAvailablePercentage > targetVillageAvailableResourcesThresholdInPercent) errorsList.push('clay')
  if (ironChanged && newIronAvailablePercentage > targetVillageAvailableResourcesThresholdInPercent) errorsList.push('iron')

  if (errorsList.length) return { errorsList }

  Object.assign(targetVillage, {
    wood: newWood,
    clay: newClay,
    iron: newIron,
    woodAvailablePercentage: newWoodAvailablePercentage,
    clayAvailablePercentage: newClayAvailablePercentage,
    ironAvailablePercentage: newIronAvailablePercentage,
    availablePercentagesList: [newWoodAvailablePercentage, newClayAvailablePercentage, newIronAvailablePercentage]
  })

  return { targetVillage }
}

/* ---------------- VERIFY ---------------- */

VillagesHandler.prototype.isSourceVillageEligible = function verifySourceVillage ({ sourceId }) {
  const { sourceVillageAvailableResourcesThresholdInPercent } = this.config
  const sourceVillage = this.getVillage({ id: sourceId })

  if (!sourceVillage) return

  const { availableMerchants, availablePercentagesList } = sourceVillage
  if (!availableMerchants) {
    this.removeVillage({ id: sourceId })
    return
  }

  const hasAvailableResources = availablePercentagesList.some(availablePercentage => availablePercentage > sourceVillageAvailableResourcesThresholdInPercent)
  // console.log({ sourceId, hasAvailableResources, sourceVillageAvailableResourcesThresholdInPercent, availablePercentagesList })
  if (hasAvailableResources) return true

  this.removeVillage({ id: sourceId })
}

VillagesHandler.prototype.isTargetVillageEligible = function isTargetVillageEligible ({ targetId }) {
  const { targetVillageAvailableResourcesThresholdInPercent } = this.config
  const targetVillage = this.getVillage({ id: targetId })
  if (!targetVillage) return

  const { availablePercentagesList } = targetVillage

  const hasEnoughResources = availablePercentagesList.some(availablePercentage => availablePercentage <= targetVillageAvailableResourcesThresholdInPercent)
  // console.log({ targetId, hasEnoughResources, targetVillageAvailableResourcesThresholdInPercent, availablePercentagesList })

  if (hasEnoughResources) return true

  this.removeVillage({ id: targetId })
}

/* ---------------- REMOVE ---------------- */

VillagesHandler.prototype.removeVillage = function removeVillage ({ id }) {
  this.villages = this.villages.filter(village => village.id !== id)

  const village = this.getVillage({ id })
  if (!village) return

  const { name } = village

  delete this.villagesById[id]
  delete this.villagesByName[name]

  console.log(`Village ${id}:${name} successfully removed`)
}

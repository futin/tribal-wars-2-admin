export function VillagesHandler ({ villages, config }) {
  this.villages = villages
  this.config = config || {}
  this.villagesByName = villages.reduce((result, village) => ({ ...result, [village.name]: village }), {})
  this.villagesById = villages.reduce((result, village) => ({ ...result, [village.id]: village }), {})
}

/* ---------------- GET ---------------- */

VillagesHandler.prototype.getAllVillages = function getAllVillages () {
  return this.villages
}

VillagesHandler.prototype.getVillage = function getVillage ({ id, name }) {
  if (id) return this.villagesById[id]
  return this.villagesByName[name]
}

/* ---------------- FIND ---------------- */

VillagesHandler.prototype.prepareTradingPlan = function prepareTradingPlan ({ sourceId, targetId }) {
  const { tradingOrder } = this.config
  const sourceVillage = this.getVillage({ id: sourceId })
  const targetVillage = this.getVillage({ id: targetId })

  const { wood: woodSource, clay: claySource, iron: ironSource, availableMerchants } = sourceVillage
  const { wood: woodTarget, clay: clayTarget, iron: ironTarget } = targetVillage

  const tradingPlan = {
    wood: 100000,
    clay: 0,
    iron: 0
  }

  // TODO: build resources trading plan

  this.updateSourceVillage({ sourceId, woodChanged: 100000, merchantsUsed: 10 })
  this.updateTargetVillage({ targetId, woodChanged: 100000 })

  return tradingPlan
}

VillagesHandler.prototype.prepareNextTradingTargets = function prepareNextTradingTargets ({ sourceId, sourceName }) {
  const sourceVillage = this.getVillage({ id: sourceId, name: sourceName })
  if (!sourceVillage) {
    console.log('prepareNextTarget: Source village not found for ', { sourceId, sourceName })
    return
  }
  const { id, targetsWithDistance } = sourceVillage

  const targets = targetsWithDistance
    .map(({ id: targetId }) => {
      const isEligible = this.isSourceVillageEligible({ sourceId: id })
      if (!isEligible) {
        return null
      }

      const target = this.isTargetVillageEligible({ targetId })
      if (!target) return null
      const tradingPlan = this.prepareTradingPlan({ sourceId, targetId })
      if (!tradingPlan) return null
      return { sourceId: id, targetId, tradingPlan }
    }).filter(Boolean)
  console.log('----FOUND TARGETS', targets)
  return targets
}

VillagesHandler.prototype.updateSourceVillage = function updateSourceVillage ({ sourceId, woodChanged = 0, clayChanged = 0, ironChanged = 0, merchantsUsed = 0 }) {
  const sourceVillage = this.getVillage({ id: sourceId })
  if (!sourceVillage) {
    console.log('updateSourceVillage: Source village not found for ', { sourceId })
    return
  }

  const { wood, clay, iron, availableMerchants, storage } = sourceVillage
  const newWood = wood - woodChanged
  const newClay = clay - clayChanged
  const newIron = iron - ironChanged
  const newAvailableMerchants = availableMerchants - merchantsUsed
  const newWoodAvailablePercentage = Math.floor(newWood / storage * 100)
  const newClayAvailablePercentage = Math.floor(newClay / storage * 100)
  const newIronAvailablePercentage = Math.floor(newIron / storage * 100)

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

  return sourceVillage
}

VillagesHandler.prototype.updateTargetVillage = function updateTargetVillage ({ targetId, woodChanged = 0, clayChanged = 0, ironChanged = 0 }) {
  const targetVillage = this.getVillage({ id: targetId })
  if (!targetVillage) {
    console.log('updateSourceVillage: Target village not found for ', { targetVillage })
    return
  }

  const { wood, clay, iron, storage } = targetVillage
  const newWood = wood + woodChanged
  const newClay = clay + clayChanged
  const newIron = iron + ironChanged
  const newWoodAvailablePercentage = Math.floor(newWood / storage * 100)
  const newClayAvailablePercentage = Math.floor(newClay / storage * 100)
  const newIronAvailablePercentage = Math.floor(newIron / storage * 100)

  Object.assign(targetVillage, {
    wood: newWood,
    clay: newClay,
    iron: newIron,
    woodAvailablePercentage: newWoodAvailablePercentage,
    clayAvailablePercentage: newClayAvailablePercentage,
    ironAvailablePercentage: newIronAvailablePercentage,
    availablePercentagesList: [newWoodAvailablePercentage, newClayAvailablePercentage, newIronAvailablePercentage]
  })

  return targetVillage
}

VillagesHandler.prototype.isSourceVillageEligible = function verifySourceVillage ({ sourceId }) {
  const { minSourceVillageResourcesThresholdInPercent } = this.config
  const sourceVillage = this.getVillage({ id: sourceId })

  if (!sourceVillage) {
    console.log('verifySourceVillage: Source village not found for ', { sourceId })
    return
  }

  const { availableMerchants, availablePercentagesList } = sourceVillage
  if (!availableMerchants) {
    this.removeVillage({ id: sourceId })
    return
  }

  const hasAvailableResources = availablePercentagesList.some(availablePercentage => availablePercentage >= minSourceVillageResourcesThresholdInPercent)
  console.log({ hasAvailableResources, minSourceVillageResourcesThresholdInPercent, availablePercentagesList })
  if (hasAvailableResources) return true
  console.log('isSourceVillageEligible: Source not eligible ', { sourceId })
  this.removeVillage({ id: sourceId })
}

VillagesHandler.prototype.isTargetVillageEligible = function isTargetVillageEligible ({ targetId }) {
  const { maxTargetVillageResourcesThresholdInPercent } = this.config
  const targetVillage = this.getVillage({ id: targetId })

  if (!targetVillage) {
    console.log('isTargetVillageEligible: Target village not found for ', { targetId })
    return
  }

  const { availablePercentagesList } = targetVillage

  const hasEnoughResources = availablePercentagesList.some(availablePercentage => availablePercentage < maxTargetVillageResourcesThresholdInPercent)
  console.log({ hasEnoughResources, maxTargetVillageResourcesThresholdInPercent, availablePercentagesList })

  if (hasEnoughResources) return true
  console.log('isTargetVillageEligible: Target not eligible ', { targetId })

  this.removeVillage({ id: targetId })
}

/* ---------------- REMOVE ---------------- */

VillagesHandler.prototype.removeVillage = function removeSourceVillage ({ id }) {
  this.villages = this.villages.filter(village => village.id !== id)
  const village = this.getVillage({ id })
  if (!village) return
  const { name } = village
  delete this.villagesById[id]
  delete this.villagesByName[name]
  console.log(`Village ${id}:${name} successfully removed`)
}

VillagesHandler.prototype.removeTargetVillage = function removeTargetVillage ({ targetId }) {
  this.villages = this.villages.filter(village => village.id !== targetId)
  const targetVillage = this.getVillage({ id: targetId })
  if (!targetVillage) return
  const { id, name } = targetVillage
  delete this.villagesById[id]
  delete this.villagesByName[name]
  console.log(`Target village ${id}:${name} successfully removed`)
}

//   id: 3170,
//   name: '(017)x',
//   x: 555,
//   y: 482,
//   storage: 94183,
//   availablePercentagesList: [ 78, 82, 22],
//   wood: 73670,
//   woodAvailablePercentage: 78,
//   clay: 77972,
//   clayAvailablePercentage: 82,
//   iron: 20871,
//   ironAvailablePercentage: 22,
//   withPriority: true,
//   availableMerchants: 46,
//   targetsWithDistance: [
//   { id: 5974, name: '(010)x', absoluteDistance: 17 },
//   { id: 5241, name: '(011)x', absoluteDistance: 18 },
//   { id: 6542, name: '(012)x', absoluteDistance: 27 },
//   { id: 6275, name: '(007)x', absoluteDistance: 28 },
//   { id: 6524, name: '(021)x', absoluteDistance: 31 },
//  ]

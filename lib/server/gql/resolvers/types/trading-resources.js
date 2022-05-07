// node core modules

// 3rd party modules

// local modules

export default {
  TradingResourcesConfigType: {
    id: ({ _id }) => _id,
    sourceVillageAvailableResourcesHighThresholdInPercent: ({ config }) => config?.sourceVillageAvailableResourcesHighThresholdInPercent,
    sourceVillageAvailableResourcesThresholdInPercent: ({ config }) => config?.sourceVillageAvailableResourcesThresholdInPercent,
    targetVillageAvailableResourcesLowThresholdInPercent: ({ config }) => config?.targetVillageAvailableResourcesLowThresholdInPercent,
    targetVillageAvailableResourcesThresholdInPercent: ({ config }) => config?.targetVillageAvailableResourcesThresholdInPercent,
    sourceVillageNamesToIgnore: ({ config }) => config?.sourceVillageNamesToIgnore || [],
    targetVillageNamesToIgnore: ({ config }) => config?.targetVillageNamesToIgnore || [],
    executedTimes: ({ executedTimes }) => executedTimes || 0,
    failedTimes: ({ failedTimes }) => failedTimes || 0
  }
}

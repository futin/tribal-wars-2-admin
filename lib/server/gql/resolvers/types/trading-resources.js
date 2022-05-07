// node core modules

// 3rd party modules

// local modules

export default {
  TradingResourcesConfigType: {
    id: ({ _id }) => _id,
    sourceVillageAvailableResourcesRichThresholdInPercent: ({ config }) => config?.sourceVillageAvailableResourcesRichThresholdInPercent,
    sourceVillageAvailableResourcesThresholdInPercent: ({ config }) => config?.sourceVillageAvailableResourcesThresholdInPercent,
    targetVillageAvailableResourcesPoorThresholdInPercent: ({ config }) => config?.targetVillageAvailableResourcesPoorThresholdInPercent,
    targetVillageAvailableResourcesThresholdInPercent: ({ config }) => config?.targetVillageAvailableResourcesThresholdInPercent,
    sourceVillageNamesToIgnore: ({ config }) => config?.sourceVillageNamesToIgnore || [],
    targetVillageNamesToIgnore: ({ config }) => config?.targetVillageNamesToIgnore || [],
    executedTimes: ({ executedTimes }) => executedTimes || 0,
    failedTimes: ({ failedTimes }) => failedTimes || 0
  }
}

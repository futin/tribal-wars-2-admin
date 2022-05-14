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
    minSourceVillageResourcesThresholdInPercent: ({ config }) => config?.minSourceVillageResourcesThresholdInPercent,
    maxTargetVillageResourcesThresholdInPercent: ({ config }) => config?.maxTargetVillageResourcesThresholdInPercent,
    sourceVillageNamesToIgnore: ({ config }) => config?.sourceVillageNamesToIgnore || [],
    targetVillageNamesToIgnore: ({ config }) => config?.targetVillageNamesToIgnore || [],
    tradingOrder: ({ config }) => config?.tradingOrder,
    executedTimes: ({ executedTimes }) => executedTimes || 0,
    failedTimes: ({ failedTimes }) => failedTimes || 0
  }
}

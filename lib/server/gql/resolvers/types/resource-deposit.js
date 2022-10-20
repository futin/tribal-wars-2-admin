// node core modules

// 3rd party modules

// local modules

export default {
  TradingResourcesConfigType: {
    id: ({ _id }) => _id,
    minRetrialIntervalInMinutes: ({ config }) => config?.minRetrialIntervalInMinutes,
    executedTimes: ({ executedTimes }) => executedTimes || 0,
    failedTimes: ({ failedTimes }) => failedTimes || 0
  }
}

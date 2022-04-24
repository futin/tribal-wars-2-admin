// node core modules

// 3rd party modules

// local modules

export default {
  FarmingConfigType: {
    id: ({ _id }) => _id,
    playerVillagesToAllow: ({ config }) => config?.playerVillagesToAllow,
    playerVillageNamesToIgnore: ({ config }) => config?.playerVillageNamesToIgnore,
    barbarianVillagesArea: ({ config }) => config?.barbarianVillagesArea,
    barbarianVillageNamesToIgnore: ({ config }) => config?.barbarianVillageNamesToIgnore,
    presetsNameStartsWith: ({ config }) => config?.presetsNameStartsWith,
    barbarianVillagesToIgnore: ({ config }) => config?.barbarianVillagesToIgnore,
    maxNonBarbarianVillagesPoints: ({ config }) => config?.maxNonBarbarianVillagesPoints,
    minRetrialIntervalInMinutes: ({ config }) => config?.minRetrialIntervalInMinutes
  }
}

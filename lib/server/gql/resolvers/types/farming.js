// node core modules

// 3rd party modules

// local modules

export default {
  FarmingConfigType: {
    id: ({ _id }) => _id,
    playerVillagesToAllow: ({ config }) => config && config.playerVillagesToAllow,
    playerVillageNamesToIgnore: ({ config }) => config && config.playerVillageNamesToIgnore,
    barbarianVillagesArea: ({ config }) => config && config.barbarianVillagesArea,
    barbarianVillageNamesToIgnore: ({ config }) => config && config.barbarianVillageNamesToIgnore,
    presetsNameStartsWith: ({ config }) => config && config.presetsNameStartsWith,
    barbarianVillagesToIgnore: ({ config }) => config && config.barbarianVillagesToIgnore,
    maxNonBarbarianVillagesPoints: ({ config }) => config && config.maxNonBarbarianVillagesPoints
  }
}

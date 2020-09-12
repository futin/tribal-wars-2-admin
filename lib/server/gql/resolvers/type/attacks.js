// node core modules

// 3rd party modules

// local modules

export default {
  AttackConfigType: {
    playerVillagesToAllow: ({ config }) => config && config.playerVillagesToAllow,
    playerVillageNamesToIgnore: ({ config }) => config && config.playerVillageNamesToIgnore,
    barbarianVillagesArea: ({ config }) => config && config.barbarianVillagesArea,
    barbarianVillageNamesToIgnore: ({ config }) => config && config.barbarianVillageNamesToIgnore,
    presetsNameStartsWith: ({ config }) => config && config.presetsNameStartsWith,
    barbarianVillagesToIgnore: ({ config }) => config && config.barbarianVillagesToIgnore,
    nonBarbarianVillagesPointsLimit: ({ config }) => config && config.nonBarbarianVillagesPointsLimit
  }
}

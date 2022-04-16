// node core modules

// 3rd party modules

// local modules

export default {
  RecruitConfigType: {
    id: ({ _id }) => _id,
    recruitmentInstructions: ({ config }) => config && config.recruitmentInstructions,
    playerVillagesToAllow: ({ config }) => config && config.playerVillagesToAllow,
    playerVillageNamesToIgnore: ({ config }) => config && config.playerVillageNamesToIgnore
  }
}

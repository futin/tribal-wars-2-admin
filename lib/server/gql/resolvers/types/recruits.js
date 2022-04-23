// node core modules

// 3rd party modules

// local modules

export default {
  RecruitConfigType: {
    id: ({ _id }) => _id,
    recruitmentInstructions: ({ config }) => config?.recruitmentInstructions,
    playerVillagesToAllow: ({ config }) => config?.playerVillagesToAllow,
    playerVillageNamesToIgnore: ({ config }) => config?.playerVillageNamesToIgnore
  }
}

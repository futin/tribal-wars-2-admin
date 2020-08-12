// node core modules

// 3rd party modules

// local modules

const farmConfig = {
  farm: {
    playerVillagesToAllow: [
      {
        name: 'Berlin',
        preferredPresetsOrder: ['40 Axe', '20 Swordsman']
      },
      {
        name: 'Munich'
      }
    ],
    barbarianVillagesArea: {
      width: 15,
      height: 15
    },
    barbarianVillageNamesToIgnore: ['craigb1\'s village']
  }
}

const recruitConfig = {
  recruit: {
    // overall instructions
    recruitmentInstructions: [
      { amount: 10, unitType: 'sword' },
      { amount: 10, unitType: 'spear' }
    ],
    playerVillagesToAllow: [
      // {
      //   name: 'Berlin'
      // },
      // {
      //   name: 'Munich',
      //   recruitmentInstructions: [
      //     { amount: 1, unitType: 'sword' },
      //     { amount: 1, unitType: 'spear' }
      //   ]
      // }
    ]
  }
}

export {
  farmConfig,
  recruitConfig
}

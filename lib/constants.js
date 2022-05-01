// node core modules

// 3rd party modules

// local modules

// MODES
export const FARMING_MODE = 'farming'
export const BUILDING_UPGRADES_MODE = 'building_upgrades'
export const ATTACK_SCHEDULER_CALCULATION_MODE = 'attack_scheduler_calculation'
export const ATTACK_SCHEDULER_MODE = 'attack_scheduler'
export const RECRUIT_UNITS_MODE = 'recruit_units'
export const RECRUIT_SPIES_MODE = 'recruit_spies'
export const VILLAGES_DATA_MODE = 'get_village_data'
export const MOVE_SPECIFIC_UNITS_MODE = 'move_specific_units'
export const RELOCATE_UNITS_MODE = 'relocate_units'
export const MASS_DONATION_MODE = 'mass_donation'
export const VALID_TW_MODES = [FARMING_MODE, BUILDING_UPGRADES_MODE, RECRUIT_UNITS_MODE, RECRUIT_SPIES_MODE, VILLAGES_DATA_MODE, ATTACK_SCHEDULER_CALCULATION_MODE, ATTACK_SCHEDULER_MODE, MOVE_SPECIFIC_UNITS_MODE, RELOCATE_UNITS_MODE, MASS_DONATION_MODE]

// SEND TYPES
export const AUTH_LOGIN_TYPE_SEND = 'Authentication/login'
export const AUTH_SELECT_CHARACTER_TYPE_SEND = 'Authentication/selectCharacter'
export const MAP_VILLAGES_BY_AREA_TYPE_SEND = 'Map/getVillagesByArea'
export const MAP_VILLAGES_DETAILS_TYPE_SEND = 'Map/getVillageDetails'
export const CHARACTER_INFO_TYPE_SEND = 'Character/getInfo'
export const ARMY_PRESETS_GET_FOR_VILLAGE_TYPE_SEND = 'ArmyPreset/getForVillage'
export const ARMY_PRESETS_LIST_TYPE_SEND = 'ArmyPreset/getPresetList'
export const COMMAND_SEND_PRESET_TYPE_SEND = 'Command/sendPreset'
export const ICON_GET_VILLAGES_TYPE_SEND = 'Icon/getVillages'
export const BARRACKS_RECRUIT_TYPE_SEND = 'Barracks/recruit'
export const HOO_RECRUIT_TYPE_SEND = 'Preceptory/recruit'
export const VILLAGES_DATA_TYPE_SEND = 'VillageBatch/getVillageData'
export const SCOUTING_RECRUIT_TYPE_SEND = 'Scouting/recruit'
export const COMMAND_SEND_CUSTOM_ARMY_TYPE_SEND = 'Command/sendCustomArmy'
export const GROUPS_TYPE_SEND = 'Group/getGroups'
export const MASS_DONATION_SEND = 'TribeSkill/massDonating'
export const GAME_DATA_SEND = 'GameDataBatch/getGameData'
export const BUILDING_UPGRADE_SEND = 'Building/upgrade'
export const GET_UNITS_INFO_SEND = 'Unit/getUnitScreenInfo'

// RECEIVE TYPES
export const AUTH_LOGIN_SUCCESS_TYPE_RECEIVE = 'Login/success'
export const MAP_VILLAGES_TYPE_RECEIVE = 'Map/villageData'
export const MAP_VILLAGES_DETAILS_TYPE_RECEIVE = 'Map/villageDetails'
export const CHARACTER_INFO_TYPE_RECEIVE = 'Character/info'
export const AUTHENTICATION_CHARACTER_SELECTED_TYPE_RECEIVE = 'Authentication/characterSelected'
export const ARMY_PRESETS_FOR_VILLAGE_TYPE_RECEIVE = 'ArmyPreset/forVillage'
export const ARMY_PRESETS_LIST_TYPE_RECEIVE = 'ArmyPreset/presetList'
export const COMMAND_SENT_PRESET_TYPE_RECEIVE = 'Command/sent'
export const SYSTEM_ERROR_TYPE_RECEIVE = 'System/error'
export const ICON_GET_VILLAGES_TYPE_RECEIVE = 'Icon/villages'
export const BARRACKS_RECRUIT_JOB_CREATED_TYPE_RECEIVE = 'Barracks/recruitJobCreated'
export const HOO_RECRUIT_JOB_CREATED_TYPE_RECEIVE = 'Preceptory/recruitJobCreated'
export const VILLAGES_DATA_TYPE_RECEIVE = 'VillageBatch/villageData'
export const SCOUTING_RECRUIT_TYPE_RECEIVE = 'Scouting/recruitingStarted'
export const MESSAGE_ERROR_TYPE_RECEIVE = 'Message/error'
export const GROUPS_TYPE_RECEIVE = 'Group/groups'
export const MASS_DONATION_RECEIVE = 'TribeSkill/donated'
export const GAME_DATA_RECEIVE = 'GameDataBatch/gameData'
export const BUILDING_UPGRADE_RECEIVE = 'Building/upgrading'
export const UNITS_INFO_RECEIVE = 'UnitScreen/data'

// ERRORS
export const SYSTEM_ERROR_COMMAND_NOT_ENOUGH_UNITS_ERROR = 'Command/notEnoughUnits'
export const SYSTEM_ERROR_ATTACK_LIMIT_EXCEEDED_ERROR = 'Command/attackLimitExceeded'
export const VILLAGE_INSUFFICIENT_RESOURCES_ERROR = 'Village/insufficientResources'
export const UNMET_REQUIREMENTS_SPY_ERROR = 'UNMET_REQUIREMENTS'

// OTHER
export const WS_DEFAULT_NUMBER = '42'
export const SOCKET_URL = 'wss://en.tribalwars2.com/socket.io/?platform=desktop&EIO=3&transport=websocket'
export const SOCKET_OPTS = {
  Host: 'en.tribalwars2.com',
  Origin: 'https://en.tribalwars2.com'
}
export const LINE_SEPARATOR = '\n=====================================================================================\n'
export const DEFAULT_TIMEZONE = 'UTC'
export const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss'
export const BACKGROUND_CELL_COLORS = {
  RED: {
    red: 100,
    green: 0,
    blue: 0,
    alpha: 1
  },
  YELLOW: {
    red: 50,
    green: 50,
    blue: 0,
    alpha: 0.5
  },
  GREEN: {
    red: 0,
    green: 110,
    blue: 0,
    alpha: 0.5
  },
  GRAY: {
    red: 110,
    green: 110,
    blue: 110,
    alpha: 1
  },
  LIGHT_PURPLE: {
    red: 1,
    green: 10,
    blue: 1,
    alpha: 1
  }
}
export const DEFAULT_CONFIG = {
  farming: {
    barbarianVillagesArea: {
      width: 10,
      height: 10
    },
    presetsNameStartsWith: '',
    barbarianVillagesToIgnore: {
      toAttack: true,
      fromAttack: false
    },
    barbarianVillageNamesToIgnore: [],
    playerVillageNamesToIgnore: [],
    playerVillagesToAllow: []
  },
  recruit: {
    playerVillageNamesToIgnore: [],
    playerVillagesToAllow: []
  },
  attackScheduler: {
    targetCoordinates: []
  },
  buildingUpgrades: {
    buildingPriority: 'RANDOM'
  }
}

// we need this offset so that the scheduler is executed before the
// last upgrade in queue finishes
export const NEXT_EXECUTION_OFFSET = 15 * 1000 * 60

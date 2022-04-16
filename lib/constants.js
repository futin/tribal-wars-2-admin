// node core modules

// 3rd party modules

// local modules

// MODES
const ATTACK_MODE = 'attack'
const BUILDING_UPGRADES_MODE = 'build'
const ATTACK_SCHEDULER_CALCULATION_MODE = 'attack_scheduler_calculation'
const ATTACK_SCHEDULER_MODE = 'attack_scheduler'
const RECRUIT_UNITS_MODE = 'recruit_units'
const RECRUIT_SPIES_MODE = 'recruit_spies'
const VILLAGES_DATA_MODE = 'get_village_data'
const MOVE_UNITS_MODE = 'move_units'
const MASS_DONATION_MODE = 'mass_donation'
const VALID_TW_MODES = [ATTACK_MODE, BUILDING_UPGRADES_MODE, RECRUIT_UNITS_MODE, RECRUIT_SPIES_MODE, VILLAGES_DATA_MODE, ATTACK_SCHEDULER_CALCULATION_MODE, ATTACK_SCHEDULER_MODE, MOVE_UNITS_MODE, MASS_DONATION_MODE]

// SEND TYPES
const AUTH_LOGIN_TYPE_SEND = 'Authentication/login'
const AUTH_SELECT_CHARACTER_TYPE_SEND = 'Authentication/selectCharacter'
const MAP_VILLAGES_BY_AREA_TYPE_SEND = 'Map/getVillagesByArea'
const MAP_VILLAGES_DETAILS_TYPE_SEND = 'Map/getVillageDetails'
const CHARACTER_INFO_TYPE_SEND = 'Character/getInfo'
const ARMY_PRESETS_GET_FOR_VILLAGE_TYPE_SEND = 'ArmyPreset/getForVillage'
const COMMAND_SEND_PRESET_TYPE_SEND = 'Command/sendPreset'
const ICON_GET_VILLAGES_TYPE_SEND = 'Icon/getVillages'
const BARRACKS_RECRUIT_TYPE_SEND = 'Barracks/recruit'
const HOO_RECRUIT_TYPE_SEND = 'Preceptory/recruit'
const VILLAGES_DATA_TYPE_SEND = 'VillageBatch/getVillageData'
const SCOUTING_RECRUIT_TYPE_SEND = 'Scouting/recruit'
const COMMAND_SEND_CUSTOM_ARMY_TYPE_SEND = 'Command/sendCustomArmy'
const GROUPS_TYPE_SEND = 'Group/getGroups'
const MASS_DONATION_SEND = 'TribeSkill/massDonating'
const GAME_DATA_SEND = 'GameDataBatch/getGameData'
const BUILDING_UPGRADE_SEND = 'Building/upgrade'

// RECEIVE TYPES
const AUTH_LOGIN_SUCCESS_TYPE_RECEIVE = 'Login/success'
const MAP_VILLAGES_TYPE_RECEIVE = 'Map/villageData'
const MAP_VILLAGES_DETAILS_TYPE_RECEIVE = 'Map/villageDetails'
const CHARACTER_INFO_TYPE_RECEIVE = 'Character/info'
const AUTHENTICATION_CHARACTER_SELECTED_TYPE_RECEIVE = 'Authentication/characterSelected'
const ARMY_PRESETS_FOR_VILLAGE_TYPE_RECEIVE = 'ArmyPreset/forVillage'
const COMMAND_SENT_PRESET_TYPE_RECEIVE = 'Command/sent'
const SYSTEM_ERROR_TYPE_RECEIVE = 'System/error'
const ICON_GET_VILLAGES_TYPE_RECEIVE = 'Icon/villages'
const BARRACKS_RECRUIT_JOB_CREATED_TYPE_RECEIVE = 'Barracks/recruitJobCreated'
const HOO_RECRUIT_JOB_CREATED_TYPE_RECEIVE = 'Preceptory/recruitJobCreated'
const VILLAGES_DATA_TYPE_RECEIVE = 'VillageBatch/villageData'
const SCOUTING_RECRUIT_TYPE_RECEIVE = 'Scouting/recruitingStarted'
const MESSAGE_ERROR_TYPE_RECEIVE = 'Message/error'
const GROUPS_TYPE_RECEIVE = 'Group/groups'
const MASS_DONATION_RECEIVE = 'TribeSkill/donated'
const GAME_DATA_RECEIVE = 'GameDataBatch/gameData'
const BUILDING_UPGRADE_RECEIVE = 'Building/upgrading'

// ERRORS
const SYSTEM_ERROR_COMMAND_NOT_ENOUGH_UNITS_ERROR = 'Command/notEnoughUnits'
const SYSTEM_ERROR_ATTACK_LIMIT_EXCEEDED_ERROR = 'Command/attackLimitExceeded'
const VILLAGE_INSUFFICIENT_RESOURCES_ERROR = 'Village/insufficientResources'

// OTHER
const WS_DEFAULT_NUMBER = '42'
const SOCKET_URL = 'wss://en.tribalwars2.com/socket.io/?platform=desktop&EIO=3&transport=websocket'
const SOCKET_OPTS = {
  Host: 'en.tribalwars2.com',
  Origin: 'https://en.tribalwars2.com'
}
const LINE_SEPARATOR = '\n=====================================================================================\n'
const DEFAULT_TIMEZONE = 'UTC'
const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss'
const BACKGROUND_CELL_COLORS = {
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
  }
}

const DEFAULT_CONFIG = {
  attack: {
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
const NEXT_EXECUTION_OFFSET = 15 * 1000 * 60

export {
  // MODES
  ATTACK_MODE,
  BUILDING_UPGRADES_MODE,
  ATTACK_SCHEDULER_CALCULATION_MODE,
  ATTACK_SCHEDULER_MODE,
  RECRUIT_UNITS_MODE,
  RECRUIT_SPIES_MODE,
  VILLAGES_DATA_MODE,
  MOVE_UNITS_MODE,
  VALID_TW_MODES,
  MASS_DONATION_MODE,
  // SEND TYPES
  AUTH_LOGIN_TYPE_SEND,
  AUTH_SELECT_CHARACTER_TYPE_SEND,
  MAP_VILLAGES_BY_AREA_TYPE_SEND,
  MAP_VILLAGES_DETAILS_TYPE_SEND,
  CHARACTER_INFO_TYPE_SEND,
  ARMY_PRESETS_GET_FOR_VILLAGE_TYPE_SEND,
  COMMAND_SEND_PRESET_TYPE_SEND,
  COMMAND_SEND_CUSTOM_ARMY_TYPE_SEND,
  ICON_GET_VILLAGES_TYPE_SEND,
  BARRACKS_RECRUIT_TYPE_SEND,
  HOO_RECRUIT_TYPE_SEND,
  VILLAGES_DATA_TYPE_SEND,
  SCOUTING_RECRUIT_TYPE_SEND,
  GROUPS_TYPE_SEND,
  MASS_DONATION_SEND,
  GAME_DATA_SEND,
  BUILDING_UPGRADE_SEND,
  // RECEIVE TYPES
  AUTH_LOGIN_SUCCESS_TYPE_RECEIVE,
  AUTHENTICATION_CHARACTER_SELECTED_TYPE_RECEIVE,
  MAP_VILLAGES_TYPE_RECEIVE,
  MAP_VILLAGES_DETAILS_TYPE_RECEIVE,
  CHARACTER_INFO_TYPE_RECEIVE,
  ARMY_PRESETS_FOR_VILLAGE_TYPE_RECEIVE,
  COMMAND_SENT_PRESET_TYPE_RECEIVE,
  SYSTEM_ERROR_TYPE_RECEIVE,
  ICON_GET_VILLAGES_TYPE_RECEIVE,
  BARRACKS_RECRUIT_JOB_CREATED_TYPE_RECEIVE,
  HOO_RECRUIT_JOB_CREATED_TYPE_RECEIVE,
  VILLAGES_DATA_TYPE_RECEIVE,
  SCOUTING_RECRUIT_TYPE_RECEIVE,
  MESSAGE_ERROR_TYPE_RECEIVE,
  GROUPS_TYPE_RECEIVE,
  MASS_DONATION_RECEIVE,
  GAME_DATA_RECEIVE,
  BUILDING_UPGRADE_RECEIVE,
  // ERRORS
  SYSTEM_ERROR_COMMAND_NOT_ENOUGH_UNITS_ERROR,
  SYSTEM_ERROR_ATTACK_LIMIT_EXCEEDED_ERROR,
  VILLAGE_INSUFFICIENT_RESOURCES_ERROR,
  // OTHER
  WS_DEFAULT_NUMBER,
  SOCKET_URL,
  SOCKET_OPTS,
  DEFAULT_CONFIG,
  LINE_SEPARATOR,
  DEFAULT_TIMEZONE,
  DATE_FORMAT,
  BACKGROUND_CELL_COLORS,
  NEXT_EXECUTION_OFFSET
}

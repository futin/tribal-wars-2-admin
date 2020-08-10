// node core modules

// 3rd party modules

// local modules

// SEND TYPES
const AUTH_LOGIN_TYPE_SEND = 'Authentication/login'
const AUTH_SELECT_CHARACTER_TYPE_SEND = 'Authentication/selectCharacter'
const MAP_VILLAGES_BY_AREA_TYPE_SEND = 'Map/getVillagesByArea'
const CHARACTER_INFO_TYPE_SEND = 'Character/getInfo'
const ARMY_PRESETS_GET_FOR_VILLAGE_TYPE_SEND = 'ArmyPreset/getForVillage'
const COMMAND_SEND_PRESET_TYPE_SEND = 'Command/sendPreset'
const ICON_GET_ATTACKING_VILLAGES_TYPE_SEND = 'Icon/getVillages'
const BARRACKS_RECRUIT_TYPE_SEND = 'Barracks/recruit'

// RECEIVE TYPES
const AUTH_LOGIN_SUCCESS_TYPE_RECEIVE = 'Login/success'
const MAP_VILLAGES_TYPE_RECEIVE = 'Map/villageData'
const CHARACTER_INFO_TYPE_RECEIVE = 'Character/info'
const ARMY_PRESETS_FOR_VILLAGE_TYPE_RECEIVE = 'ArmyPreset/forVillage'
const COMMAND_SENT_PRESET_TYPE_RECEIVE = 'Command/sent'
const SYSTEM_ERROR_TYPE_RECEIVE = 'System/error'
const ICON_GET_ATTACKING_VILLAGES_TYPE_RECEIVE = 'Icon/villages'
const BARRACKS_RECRUIT_JOB_CREATED_TYPE_RECEIVE = 'Barracks/recruitJobCreated'

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

const DEFAULT_CONFIG = {
  farm: {
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
    recruitAmount: 0,
    recruitUnitType: '',
    playerVillageNamesToIgnore: [],
    playerVillagesToAllow: []
  }
}

// SERVER
const SERVER_HOST = 'localhost'
const SERVER_PORT = 3016

const VALID_TW_MODES = ['farm', 'recruit']

module.exports = {
  // SEND TYPES
  AUTH_LOGIN_TYPE_SEND,
  AUTH_SELECT_CHARACTER_TYPE_SEND,
  MAP_VILLAGES_BY_AREA_TYPE_SEND,
  CHARACTER_INFO_TYPE_SEND,
  ARMY_PRESETS_GET_FOR_VILLAGE_TYPE_SEND,
  COMMAND_SEND_PRESET_TYPE_SEND,
  ICON_GET_ATTACKING_VILLAGES_TYPE_SEND,
  BARRACKS_RECRUIT_TYPE_SEND,
  BARRACKS_RECRUIT_JOB_CREATED_TYPE_RECEIVE,
  // RECEIVE TYPES
  AUTH_LOGIN_SUCCESS_TYPE_RECEIVE,
  MAP_VILLAGES_TYPE_RECEIVE,
  CHARACTER_INFO_TYPE_RECEIVE,
  ARMY_PRESETS_FOR_VILLAGE_TYPE_RECEIVE,
  COMMAND_SENT_PRESET_TYPE_RECEIVE,
  SYSTEM_ERROR_TYPE_RECEIVE,
  ICON_GET_ATTACKING_VILLAGES_TYPE_RECEIVE,
  // SERVER
  SERVER_HOST,
  SERVER_PORT,
  // ERRORS
  SYSTEM_ERROR_COMMAND_NOT_ENOUGH_UNITS_ERROR,
  SYSTEM_ERROR_ATTACK_LIMIT_EXCEEDED_ERROR,
  VILLAGE_INSUFFICIENT_RESOURCES_ERROR,
  // OTHER
  WS_DEFAULT_NUMBER,
  SOCKET_URL,
  SOCKET_OPTS,
  DEFAULT_CONFIG,
  VALID_TW_MODES
}


// 3rd party modules
import _ from 'lodash'

// local modules
import {
  AUTH_LOGIN_SUCCESS_TYPE_RECEIVE, CHARACTER_INFO_TYPE_RECEIVE, SYSTEM_ERROR_TYPE_RECEIVE,
  AUTHENTICATION_CHARACTER_SELECTED_TYPE_RECEIVE, VILLAGES_DATA_TYPE_RECEIVE, MASS_DONATION_RECEIVE
} from '#global-constants'

const executors = ({ senders }) =>
  ({
    [AUTH_LOGIN_SUCCESS_TYPE_RECEIVE]: ({ response, config }) => {
      const { worldName } = config.auth
      const characters = _.get(response, 'data.characters', [])
      let character = characters[0]

      if (worldName) character = characters.find(character => character.world_name === worldName) || character

      const { character_id: characterId, world_id: worldId } = character

      senders.sendAuthCharSelectData({ characterId, worldId })
    },
    [AUTHENTICATION_CHARACTER_SELECTED_TYPE_RECEIVE]: ({ response }) => {
      const ownerId = _.get(response, 'data.owner_id')
      if (ownerId) return senders.sendGetCharacterInfo()
      senders.close('Character not found')
    },
    [CHARACTER_INFO_TYPE_RECEIVE]: ({ response, config }) => {
      if (!config.isMassDonation) return console.log('Not called for mass donation')

      const characterVillages = _.get(response, 'data.villages')
      const villageIds = characterVillages.map(({ id }) => id)
      senders.sendGetVillagesData({ villageIds })
    },
    [VILLAGES_DATA_TYPE_RECEIVE]: ({ response, config }) => {
      const { playerVillageNamesToAllow = [], playerVillageNamesToIgnore = [], percentage = 10 } = config
      const resourcesToDonate = _.reduce(response.data, (result, villageInfo) => {
        const availableResources = _.get(villageInfo, 'Village/village.resources')
        const village = _.get(villageInfo, 'Village/village')

        // ignore ignored villages
        if (playerVillageNamesToIgnore && playerVillageNamesToIgnore.length && playerVillageNamesToIgnore.includes(village.name)) return result

        // ignore non-allowed villages
        if (playerVillageNamesToAllow && playerVillageNamesToAllow.length && !playerVillageNamesToAllow.includes(village.name)) return result

        const resourcesToDonate = _.pick(availableResources, ['wood', 'clay', 'iron'])

        // apply provided percentage on all resources
        _.forEach(resourcesToDonate, (resource, resourceName) => {
          resourcesToDonate[resourceName] = (resource * percentage) / 100
        })

        return result.concat({ id: village.villageId, resources: resourcesToDonate })
      }, [])

      senders.sendMassDonation({ villages: resourcesToDonate })
    },
    [MASS_DONATION_RECEIVE]: ({ response }) => {
      const donorId = _.get(response, 'data.donor_id')
      const donorName = _.get(response, 'data.donor_name')

      if (donorId && donorName) return senders.close('Donation finished')
      senders.close('Error with donation')
    },
    [SYSTEM_ERROR_TYPE_RECEIVE]: ({ response }) => {
      const errorCause = _.get(response, 'data.cause')
      const errorCode = _.get(response, 'data.code')

      senders.close(`Error: ${errorCause};${errorCode}`)
    }
  })

export default executors

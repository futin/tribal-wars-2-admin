// node core modules

// 3rd party modules
import { GraphQLScalarType } from 'graphql'
import moment from 'moment-timezone'

// local modules
import { DATE_FORMAT } from '../../../../constants'

const DateTime = new GraphQLScalarType({
  name: 'DateTime',
  description: 'Date represented as utc string YYYY-MM-DD HH:mm:ss',
  serialize: (value) => {
    return moment.utc(value).format(DATE_FORMAT)
  },
  parseValue: (value) => {
    return moment.utc(value, DATE_FORMAT).toDate()
  },
  parseLiteral: ({ value }) => {
    return moment.utc(value, DATE_FORMAT).toDate()
  }
})

export default {
  DateTime
}

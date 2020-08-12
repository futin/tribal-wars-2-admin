// node core modules

// 3rd party modules
import { GraphQLScalarType } from 'graphql'
import moment from 'moment-timezone'

// local modules
const DateTime = new GraphQLScalarType({
  name: 'DateTime',
  description: 'Date represented as utc string YYYY-MM-DD HH:mm:ss',
  serialize: (value) => {
    return moment(value).format('YYYY-MM-DD HH:mm:ss')
  },
  parseValue: (value) => {
    return moment(value, 'YYYY-MM-DD HH:mm:ss').toDate()
  },
  parseLiteral: ({ value }) => {
    return moment(value, 'YYYY-MM-DD HH:mm:ss').toDate()
  }
})

export default {
  DateTime
}

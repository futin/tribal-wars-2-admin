// node core modules

// 3rd party modules
import { ApolloServer } from 'apollo-server-express'
import { AuthenticationError } from 'apollo-server'
import _ from 'lodash'
import express from 'express'

// local modules
import { typeDefs, resolvers } from './gql'
import methods from './methods'

const { API_TOKEN } = process.env

const { AUTH_NAME, AUTH_TOKEN, WORLD_NAME } = process.env

const inMemoryStorage = {
  attackConfigs: [],
  recruitConfigs: [],
  healthCheckInterval: null
}
const auth = {
  name: AUTH_NAME,
  token: AUTH_TOKEN,
  worldName: WORLD_NAME
}

const settings = {
  typeDefs,
  resolvers,
  context: ({ req }) => {
    if (_.isEmpty(req.body)) return
    const { authorization } = req.headers
    if (!(authorization && authorization.includes(API_TOKEN))) {
      throw new AuthenticationError('Unauthorized')
    }
    return { inMemoryStorage, auth, methods }
  }
}

const apolloServer = new ApolloServer(settings)
const app = express()

// custom middlewares
app.get('/health', (req, res) => res.send('OK'))

apolloServer.applyMiddleware({ app, path: '/' })

export default app

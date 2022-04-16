// node core modules

// 3rd party modules
import _ from 'lodash'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { AuthenticationError } from 'apollo-server'

// local modules
import tribalWarsExecutors from '#tw-executors'
import { mongoSetup, models } from './mongodb/index.js'
import methods from './methods/index.js'
import { typeDefs, resolvers } from './gql/index.js'
import setupMiddlewares from './middlewares/index.js'

const { API_TOKEN, AUTH_NAME, AUTH_TOKEN, WORLD_NAME, GOOGLE_DOC_PRIVATE_KEY, GOOGLE_DOC_CLIENT_EMAIL } = process.env

const auth = {
  name: AUTH_NAME,
  token: AUTH_TOKEN,
  worldName: WORLD_NAME
}

const googleDocAuth = {
  private_key: GOOGLE_DOC_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: GOOGLE_DOC_CLIENT_EMAIL
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

    return { methods, models, auth, googleDocAuth }
  }
}

const apolloServer = new ApolloServer(settings)
const app = express()

// setup custom middlewares
setupMiddlewares({ app, methods, models, auth, tribalWarsExecutors })

apolloServer.applyMiddleware({ app, path: '/' })

export {
  app,
  mongoSetup
}

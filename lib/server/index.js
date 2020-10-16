// node core modules

// 3rd party modules
import _ from 'lodash'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { AuthenticationError } from 'apollo-server'

// local modules
import { mongoSetup, models } from './mongodb'
import methods from './methods'
import { typeDefs, resolvers } from './gql'
import setupMiddlewares from './middlewares'
import tribalWarsAdmin from '../tw'
import googleDocAuth from '../../google-doc-cred.json'

const { API_TOKEN, AUTH_NAME, AUTH_TOKEN, WORLD_NAME } = process.env

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

    return { methods, models, auth, googleDocAuth }
  }
}

const apolloServer = new ApolloServer(settings)
const app = express()

// setup custom middlewares
setupMiddlewares({ app, methods, models, auth, tribalWarsAdmin })

apolloServer.applyMiddleware({ app, path: '/' })

export {
  app,
  mongoSetup
}

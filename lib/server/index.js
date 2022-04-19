// node core modules

// 3rd party modules
import _ from 'lodash'
import express from 'express'
import { AuthenticationError, ValidationError } from 'apollo-server'

// local modules
import tribalWarsExecutors from '#tw-executors'
import { mongoSetup, models } from './mongodb/index.js'
import methods from './methods/index.js'
import { typeDefs, resolvers } from './gql/index.js'
import setupCustomMiddlewares from './middlewares/index.js'

const { API_SECRET_TOKEN, TW_AUTH_NAME, TW_AUTH_TOKEN, TW_WORLD_NAME, GOOGLE_DOC_PRIVATE_KEY, GOOGLE_DOC_CLIENT_EMAIL, NODE_ENV } = process.env

if (!TW_AUTH_TOKEN) throw new ValidationError('[TW_AUTH_TOKEN] must be provided')
const auth = {
  name: TW_AUTH_NAME,
  token: TW_AUTH_TOKEN,
  worldName: TW_WORLD_NAME
}

const googleDocAuth = {}

if (GOOGLE_DOC_PRIVATE_KEY && GOOGLE_DOC_CLIENT_EMAIL) {
  Object.assign(googleDocAuth, {
    private_key: GOOGLE_DOC_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: GOOGLE_DOC_CLIENT_EMAIL
  })
}

const apolloServerSettings = {
  typeDefs,
  resolvers,
  context: ({ req }) => {
    if (_.isEmpty(req.body)) return
    const { authorization } = req.headers
    if (NODE_ENV === 'production' && !(authorization && authorization.includes(API_SECRET_TOKEN))) {
      throw new AuthenticationError('Unauthorized')
    }

    return { methods, models, auth, googleDocAuth }
  }
}

const app = express()

// setup custom middlewares
setupCustomMiddlewares({ app, methods, models, auth, tribalWarsExecutors })

export {
  app,
  apolloServerSettings,
  mongoSetup
}

// node core modules

// 3rd party modules
import _ from 'lodash'
import express from 'express'
import { AuthenticationError } from 'apollo-server'

// local modules
import tribalWarsExecutors from '#tw-executors'
import { mongoSetup, models } from './mongodb/index.js'
import methods from './methods/index.js'
import { typeDefs, resolvers } from './gql/index.js'
import setupCustomMiddlewares from './middlewares/index.js'
import { buildAuth } from '#global-utils'

const env = process.env

const { API_SECRET_TOKEN, GOOGLE_DOC_PRIVATE_KEY, GOOGLE_DOC_CLIENT_EMAIL, NODE_ENV } = env
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
  context: async ({ req }) => {
    if (_.isEmpty(req.body)) return
    const { authorization, account_id: accountId } = req.headers
    if (NODE_ENV === 'production' && !(authorization && authorization.includes(API_SECRET_TOKEN))) {
      throw new AuthenticationError('Unauthorized')
    }

    const auth = await buildAuth({ models, methods, accountId })

    return { models, methods, googleDocAuth, auth }
  }
}

const app = express()

// setup custom middlewares
setupCustomMiddlewares({ app, methods, models, tribalWarsExecutors })

export {
  app,
  apolloServerSettings,
  mongoSetup,
  models,
  methods
}

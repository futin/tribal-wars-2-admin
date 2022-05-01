// node core modules
import http from 'http'

// local modules
import axios from 'axios'
import 'dotenv/config'

// 3rd party modules
import { setRandomInterval } from '#global-utils'
import { app, apolloServerSettings, mongoSetup } from './server/index.js'
import { ApolloServer } from 'apollo-server-express'

(async () => {
  await mongoSetup()
  await initApolloServer()
  initServer()
  setupScheduler()
})()

const initApolloServer = async () => {
  const apolloServer = new ApolloServer(apolloServerSettings)
  await apolloServer.start()
  apolloServer.applyMiddleware({ app, path: '/' })
}

const initServer = () => {
  let { PORT = 3018, SERVER_URL } = process.env
  SERVER_URL = SERVER_URL || `http://localhost:${PORT}`

  const server = http.createServer(app)
  server.listen(PORT, async () => {
    console.log(`Server ready at ${SERVER_URL}`)
  })
}

const setupScheduler = () => {
  const { SERVER_URL } = process.env
  axios.get(`${SERVER_URL}/scheduler`)

  setRandomInterval(() => {
    console.log('PING:scheduler')
    axios.get(`${SERVER_URL}/scheduler`)
  }, { min: 10 * 60, max: 15 * 60 })
}

// node core modules
import http from 'http'

// local modules
import axios from 'axios'
import 'dotenv/config'

// 3rd party modules
import { setRandomInterval } from '#global-utils'
import { app, mongoSetup } from './server/index.js'

(async () => {
  await mongoSetup()
  initServer()
  setupScheduler()
})()

const initServer = () => {
  const { PORT, HOST } = process.env
  const server = http.createServer(app)

  server.listen(PORT, async () => {
    console.log(`Server ready at http://${HOST}:${PORT}`)
  })
}

const setupScheduler = () => {
  const { SERVER_URL } = process.env

  setRandomInterval(() => {
    console.log('PING:scheduler')
    axios.get(`${SERVER_URL}/scheduler`)
  }, { min: 10 * 60, max: 15 * 60 })
}

// node core modules
import http from 'http'

// local modules
import 'regenerator-runtime/runtime'
import axios from 'axios'

// 3rd party modules
import { app, mongoSetup } from './server'

(async () => {
  await mongoSetup()
  setupScheduler()
  initServer()
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

  setInterval(() => {
    console.log('PING')
    axios.get(`${SERVER_URL}/scheduler`)
  }, 10 * 60 * 1000)

  setInterval(() => {
    axios.get(`${SERVER_URL}/attack-scheduler`)
  }, 60 * 1000)
}

// node core modules
const http = require('http')

// 3rd party modules
const { delay } = require('promises-to-retry')
const express = require('express')
const bodyParser = require('body-parser')

// internal modules
const tribalWarsAdmin = require('../index')
const { roundRandomWithRange } = require('../utils')
const { farmConfig, recruitConfig } = require('./configs')
const { SERVER_HOST: host, SERVER_PORT: port } = require('../constants')

const baseConfiguration = (app) => {
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json())
}

const initServer = (app) => {
  const server = http.createServer(app)
  server.listen(port, host, () => {
    console.log(`Server listening at http://${host}:${port}`) // eslint-disable-line no-console
  })
}

// App configuration and server initialization
(async () => {
  const app = express()
  let attackCounter = 1
  let recruitCounter = 1

  baseConfiguration(app)

  initServer(app)

  await delay(2000)
  // start farming
  setInterval(() => {
    attackCounter += 1
    console.log(`Attacked ${attackCounter} times`)
    tribalWarsAdmin({ config: farmConfig, mode: 'farm' })
  }, roundRandomWithRange({ min: 10 * 60, randomize: 10 * 60 }) * 1000)
  tribalWarsAdmin({ config: farmConfig, mode: 'farm' })

  // start recruiting
  setInterval(() => {
    recruitCounter += 1
    console.log(`Recruited ${recruitCounter} times`)
    tribalWarsAdmin({ config: recruitConfig, mode: 'recruit' })
  }, roundRandomWithRange({ min: 25 * 60, randomize: 10 * 60 }) * 1000)
})()

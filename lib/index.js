// node core modules

import http from 'http'

// local modules
import expressApp from './server'

// 3rd party modules

const { PORT, HOST } = process.env
const server = http.createServer(expressApp)

server.listen(PORT, async () => {
  console.log(`Server ready at http://${HOST}:${PORT}`)
})

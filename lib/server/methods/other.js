// node core modules
import axios from 'axios'

// 3rd party modules

// local modules
const { SERVER_URL } = process.env

/* SET */
const activateHealthCheck = ({ inMemoryStorage, intervalInMinutes }) => {
  if (inMemoryStorage.healthCheckInterval) return
  inMemoryStorage.healthCheckInterval = setInterval(() => {
    console.log('PING')
    axios.get(`${SERVER_URL}/health`)
  }, intervalInMinutes * 60 * 1000)

  return true
}

/* DELETE */
const deactivateHealthCheck = ({ inMemoryStorage }) => {
  if (!inMemoryStorage.healthCheckInterval) return

  clearInterval(inMemoryStorage.healthCheckInterval)
  inMemoryStorage.healthCheckInterval = null

  return true
}

export {
  // SET
  activateHealthCheck,
  // DELETE
  deactivateHealthCheck
}

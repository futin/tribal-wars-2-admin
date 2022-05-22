import { textToHash } from '#global-utils'

const activeSessions = {}

const buildSessionKeyFromAuth = (auth) => {
  if (!auth) throw new Error('Invalid auth provided')
  return textToHash(JSON.stringify(auth))
}

export const getSession = (auth) => {
  const key = buildSessionKeyFromAuth(auth)
  return activeSessions[key]
}

export const startSession = ({ auth, ws }) => {
  if (!ws) throw new Error('WebSocket instance is required for session')

  const key = buildSessionKeyFromAuth(auth)
  if (activeSessions[key]) return

  activeSessions[key] = { ws }

  return auth
}

export const addSessionResponse = ({ auth, characterResponse }) => {
  if (!characterResponse) throw new Error('characterResponse is required for session')

  const key = buildSessionKeyFromAuth(auth)
  if (!activeSessions[key]) return

  activeSessions[key].characterResponse = characterResponse

  return activeSessions[key]
}

export const removeSession = (auth) => {
  const key = buildSessionKeyFromAuth(auth)
  activeSessions[key] = null
}

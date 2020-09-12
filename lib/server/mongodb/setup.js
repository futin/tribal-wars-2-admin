// core modules

// 3rd party modules
import mongoose from 'mongoose'

// internal modules
import { ing } from '../../utils'

const setupMongoose = async () => {
  console.log('Connecting to MongoDB')

  const [error] = await ing(mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true }))

  if (error) {
    console.error('Unable to connect to MongoDB ', error)
    process.exit()
  }

  console.log('Connected to MongoDB!')
}

module.exports = setupMongoose

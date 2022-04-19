// core modules

// 3rd party modules
import mongoose from 'mongoose'

// internal modules
import { ing } from '#global-utils'

export default async function setupMongoose () {
  const { MONGO_URL } = process.env
  if (!MONGO_URL) return

  const [error] = await ing(mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true }))

  if (error) {
    console.error('Unable to connect to MongoDB ', error)
    process.exit()
  }

  console.log('Connected to MongoDB!')
}
// mongoose v6 setup
// // core modules
//
// // 3rd party modules
// import mongoose from 'mongoose'
//
// // internal modules
//
// export default async function setupMongoose () {
//   const { MONGO_URL } = process.env
//   if (!MONGO_URL) return
//
//   try {
//     await mongoose.connect(MONGO_URL)
//   } catch (error) {
//     console.error('Unable to connect to MongoDB ', error)
//     process.exit()
//   }
//
//   console.log('Connected to MongoDB!')
// }

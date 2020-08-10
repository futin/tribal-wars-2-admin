// node core modules
import fs from 'fs'
import path from 'path'

// 3rd party modules
import glob from 'glob'
import { gql } from 'apollo-server'

// local modules

const typeDefs = glob.sync('lib/server/gql/schemas/**/*.gql').reduce((result, filePath) =>
  result + fs.readFileSync(path.join(process.cwd(), filePath)) + '\n', '')

export default gql(typeDefs)

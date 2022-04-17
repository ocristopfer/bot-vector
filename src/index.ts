import 'dotenv/config'
import * as path from 'path'
import { Bot } from './bot'
import container from './inversify.config'
import { WebService } from './services'
import { TYPES } from './types'

global.appRoot = path.resolve(__dirname)
const bot = container.get<Bot>(TYPES.Bot)
bot.init()

const webService = container.get<WebService>(TYPES.WebService)
webService.init()

import 'dotenv/config'
import { Bot } from './bot'
import container from './inversify.config'
import { WebService } from './services'
import { TYPES } from './types'

const bot = container.get<Bot>(TYPES.Bot)
bot.init()

const webService = container.get<WebService>(TYPES.WebService)
webService.init()

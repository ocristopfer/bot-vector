import 'dotenv/config'
import Bot from './bot/bot'
import container from './inversify.config'
import { WebService } from './services'
import { TYPES } from './types'

let bot = container.get<Bot>(TYPES.Bot)
bot.init()

let webService = container.get<WebService>(TYPES.WebService)
webService.init()

import Bot from './bot'
import container from './inversify.config'
import { TYPES } from './types'
let bot = container.get<Bot>(TYPES.Bot)
bot.init()

import 'dotenv/config'
import { Bot } from './bot'
import container from './inversify.config'
import { TYPES } from './types'

const bot = container.get<Bot>(TYPES.Bot)
bot.init()
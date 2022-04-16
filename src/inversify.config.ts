import 'reflect-metadata'
import { Container } from 'inversify'
import { TYPES } from './types'
import Bot from './bot'
import LogHandler from './handlers/logHandler'
import MusicHandler from './handlers/musicHandler'
import BotHandler from './handlers/botHandler'
import { Client } from 'discord.js'
import WebHandler from './handlers/webHandler'
import BotDesconect from './services/botDesconect'

let container = new Container()

container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope()
container.bind<BotHandler>(TYPES.BotHandler).to(BotHandler).inSingletonScope()
container
  .bind<BotDesconect>(TYPES.BotDesconect)
  .to(BotDesconect)
  .inSingletonScope()

container.bind<LogHandler>(TYPES.LogHandler).to(LogHandler).inSingletonScope()
container.bind<WebHandler>(TYPES.WebHandler).to(WebHandler).inSingletonScope()
container
  .bind<MusicHandler>(TYPES.MusicHandler)
  .to(MusicHandler)
  .inSingletonScope()

//const
container.bind<Client>(TYPES.Client).toConstantValue(new Client())
container.bind<Map<any, any>>(TYPES.SongQueue).toConstantValue(new Map())

export default container

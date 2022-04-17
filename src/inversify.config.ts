import 'reflect-metadata'
import { Client } from 'discord.js'
import { Container } from 'inversify'
import Bot from './bot/bot'
import BotGateway from './bot/bot.gateway'
import { YouTubeService } from './bot/services'
import { LogHandler } from './handlers'
import MusicHandler from './bot/handlers/music.handler'
import { WebService } from './services'
import { TYPES } from './types'
import {
  BotComandClearChat,
  BotComandDesconectar,
  BotComandExit,
  BotComandHelp,
  BotComandListarMusicas,
  BotComandPing,
  BotComandPlay,
  BotComandSkip,
  BotComandStop,
} from './bot/usecases'
import BotComandsHandler from './bot/handlers/comands.handler'
import BotUserChangeChannelHandler from './bot/handlers/user.change.channel.handler'
import { SongQueue } from './bot/interfaces'

const container = new Container()

container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope()
container.bind<BotGateway>(TYPES.BotGateway).to(BotGateway).inSingletonScope()
container
  .bind<BotComandsHandler>(TYPES.BotComandsHandler)
  .to(BotComandsHandler)
  .inSingletonScope()
container
  .bind<BotUserChangeChannelHandler>(TYPES.BotUserChangeChannelHandler)
  .to(BotUserChangeChannelHandler)
  .inSingletonScope()

container.bind<LogHandler>(TYPES.LogHandler).to(LogHandler).inSingletonScope()
container
  .bind<MusicHandler>(TYPES.MusicHandler)
  .to(MusicHandler)
  .inSingletonScope()

// Services
container.bind<WebService>(TYPES.WebService).to(WebService).inSingletonScope()
container
  .bind<YouTubeService>(TYPES.YouTubeService)
  .to(YouTubeService)
  .inSingletonScope()

// Bot Comands
container
  .bind<BotComandPlay>(TYPES.BotComandplay)
  .to(BotComandPlay)
  .inSingletonScope()

container
  .bind<BotComandSkip>(TYPES.BotComandskip)
  .to(BotComandSkip)
  .inSingletonScope()

container
  .bind<BotComandStop>(TYPES.BotComandstop)
  .to(BotComandStop)
  .inSingletonScope()

container
  .bind<BotComandListarMusicas>(TYPES.BotComandlistar)
  .to(BotComandListarMusicas)
  .inSingletonScope()

container
  .bind<BotComandDesconectar>(TYPES.BotComanddesconectar)
  .to(BotComandDesconectar)
  .inSingletonScope()

container
  .bind<BotComandClearChat>(TYPES.BotComandclearchat)
  .to(BotComandClearChat)
  .inSingletonScope()

container
  .bind<BotComandPing>(TYPES.BotComandping)
  .to(BotComandPing)
  .inSingletonScope()

container
  .bind<BotComandHelp>(TYPES.BotComandhelp)
  .to(BotComandHelp)
  .inSingletonScope()

container
  .bind<BotComandExit>(TYPES.BotComandexit)
  .to(BotComandExit)
  .inSingletonScope()
// const
container.bind<Client>(TYPES.Client).toConstantValue(new Client())
container
  .bind<Map<string, SongQueue>>(TYPES.SongQueue)
  .toConstantValue(new Map())
container.bind<string>(TYPES.Prefix).toConstantValue(process.env.PREFIX || '!')

export default container

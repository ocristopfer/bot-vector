import 'reflect-metadata'
import { Client } from 'discord.js'
import { Container } from 'inversify'
import { YoutubeDataAPI } from 'youtube-v3-api'
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
  BotComandListen,
  BotComandPause,
  BotComandPing,
  BotComandPlay,
  BotComandPlayList,
  BotComandResume,
  BotComandSkip,
  BotComandStop,
} from './bot/usecases'

import { SongQueue } from './bot/interfaces'
import path from 'path'
import {
  BotComandsHandler,
  GuildMemberSpeakingHandler,
  UserChangeChannelHandler,
} from './bot/handlers'

const container = new Container()

container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope()
container.bind<BotGateway>(TYPES.BotGateway).to(BotGateway).inSingletonScope()
container
  .bind<BotComandsHandler>(TYPES.BotComandsHandler)
  .to(BotComandsHandler)
  .inSingletonScope()
container
  .bind<UserChangeChannelHandler>(TYPES.UserChangeChannelHandler)
  .to(UserChangeChannelHandler)
  .inSingletonScope()

container
  .bind<GuildMemberSpeakingHandler>(TYPES.GuildMemberSpeakingHandler)
  .to(GuildMemberSpeakingHandler)
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
  .bind<BotComandPlayList>(TYPES.BotComandplaylist)
  .to(BotComandPlayList)
  .inSingletonScope()

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

container
  .bind<BotComandPause>(TYPES.BotComandpause)
  .to(BotComandPause)
  .inSingletonScope()

container
  .bind<BotComandResume>(TYPES.BotComandresume)
  .to(BotComandResume)
  .inSingletonScope()

container
  .bind<BotComandListen>(TYPES.BotComandlisten)
  .to(BotComandListen)
  .inSingletonScope()

// const
container.bind<string>(TYPES.AppRoot).toConstantValue(path.resolve(__dirname))
container.bind<Client>(TYPES.Client).toConstantValue(new Client())

container
  .bind<object>(TYPES.YoutubeDataAPI)
  .toConstantValue(new YoutubeDataAPI(process.env.YOUTUBEAPI))

container
  .bind<Map<string, SongQueue>>(TYPES.SongQueue)
  .toConstantValue(new Map())
container.bind<string>(TYPES.Prefix).toConstantValue(process.env.PREFIX || '!')

export default container

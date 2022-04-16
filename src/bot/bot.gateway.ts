import { Client } from 'discord.js'
import LogHandler from '../handlers/log.handler'
import { inject, injectable } from 'inversify'
import { TYPES } from '../types'
import BotComandsHandler from './handlers/comands.handler'
import BotUserChangeChannelHandler from './handlers/user.change.channel.handler'

@injectable()
export default class BotGateway {
  private botClient: Client
  private logHandler: LogHandler
  private botComandsHandler: BotComandsHandler
  private botUserChangeChannelHandler: BotUserChangeChannelHandler
  constructor(
    @inject(TYPES.Client) botClient: Client,
    @inject(TYPES.LogHandler) logHandler: LogHandler,
    @inject(TYPES.BotComandsHandler) botComandsHandler: BotComandsHandler,
    @inject(TYPES.BotUserChangeChannelHandler)
    botUserChangeChannelHandler: BotUserChangeChannelHandler,
  ) {
    this.botClient = botClient
    this.logHandler = logHandler
    this.botComandsHandler = botComandsHandler
    this.botUserChangeChannelHandler = botUserChangeChannelHandler
  }
  public init = () => {
    this.eventsBot()
    this.startBot()
  }

  private startBot = () => {
    const token = process.env.TOKEN || ''
    if (token !== '') {
      this.botClient.login(token)
    } else {
      this.logHandler.log('Configure seu token no aquivo .env')
      process.exit(0)
    }
  }

  private eventsBot = () => {
    this.botClient.once('ready', () => {
      this.logHandler.log('Bot Iniciado')
    })

    this.botClient.on('guildMemberAdd', async (member: any) => {
      member.guild.channels.get('channelID').send('Bem Vindo :D')
    })

    this.botClient.on('voiceStateUpdate', async (oldMember, newMember) => {
      this.botUserChangeChannelHandler.handler(oldMember, newMember)
    })

    this.botClient.on('message', async (message) => {
      return this.botComandsHandler.handle(message)
    })
  }
}

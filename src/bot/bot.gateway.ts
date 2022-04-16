import { Client, Message } from 'discord.js'
import LogHandler from '../handlers/log.handler'
import { inject, injectable } from 'inversify'
import { TYPES } from '../types'
import BotComandsHandler from './handlers/comands.handler'

@injectable()
export default class BotGateway {
  private botClient: Client
  private logHandler: LogHandler
  private botComandsHandler: BotComandsHandler
  constructor(
    @inject(TYPES.Client) botClient: Client,
    @inject(TYPES.BotComandsHandler) botComandsHandler: BotComandsHandler,
  ) {
    this.botClient = botClient
    this.logHandler = new LogHandler()
    this.botComandsHandler = botComandsHandler
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
      this.logHandler.log('Iniciado')
    })

    this.botClient.on('guildMemberAdd', async (member: any) => {
      member.guild.channels.get('channelID').send('Bem Vindo :D')
    })

    this.botClient.on('voiceStateUpdate', async (oldMember, newMember) => {
      if (oldMember.channelID !== newMember.channelID) {
        this.usuarioMudouDeCanal(oldMember, false)
        this.usuarioMudouDeCanal(newMember, true)
      }
    })

    this.botClient.on('message', async (message) => {
      return this.botComandsHandler.handle(message)
    })
  }

  //Comandos

  private usuarioMudouDeCanal = (oMember: any, bFlEntrou: boolean) => {
    if (oMember.id === '610170869339390035') return
    this.botClient.channels
      .fetch(oMember.channelID)
      .then((resolve) => {
        const mensagem = `${oMember.member} ${
          bFlEntrou ? 'Entrou' : 'Saiu'
        } do canal de voz ${resolve}`
        oMember.guild.channels.cache
          .filter(
            (channel: any) =>
              channel.name === 'chat' || channel.name === 'geral',
          )
          .first()
          .send(mensagem)
      })
      .catch(() => {
        //problema na api relata erro toda hora mesmo com a rotina funcionando
        //logHandler.log(error);
      })
  }
}

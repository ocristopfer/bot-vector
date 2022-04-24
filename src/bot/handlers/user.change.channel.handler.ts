import { Client, TextChannel, VoiceState } from 'discord.js'
import { inject, injectable } from 'inversify'
import { LogHandler } from '../../handlers'
import { TYPES } from '../../types'

@injectable()
export default class UserChangeChannelHandler {
  private botClient: Client
  private logHandler: LogHandler
  constructor(
    @inject(TYPES.Client) botClient: Client,
    @inject(TYPES.LogHandler) logHandler: LogHandler,
  ) {
    this.botClient = botClient
    this.logHandler = logHandler
  }

  public handler = (oldMember: VoiceState, newMember: VoiceState) => {
    if (oldMember.channelID !== newMember.channelID) {
      this.usuarioMudouDeCanal(oldMember, false)
      this.usuarioMudouDeCanal(newMember, true)
    }
  }

  private usuarioMudouDeCanal = (oMember: any, bFlEntrou: boolean) => {
    try {
      //Ignora vector bot ou o vector bot dev
      if (
        oMember.id === '610170869339390035' ||
        oMember.id === '765669577949446174'
      )
        return
      this.botClient.channels
        .fetch(oMember.channelID)
        .then((resolve) => {
          const mensagem = `${oMember.member} ${
            bFlEntrou ? 'Entrou' : 'Saiu'
          } do canal de voz ${resolve}`
          oMember.guild.channels.cache
            .filter(
              (channel: TextChannel) =>
                channel.name === 'chat' || channel.name === 'geral',
            )
            .first()
            .send(mensagem)
        })
        .catch(() => {
          //problema na api relata erro toda hora mesmo com a rotina funcionando
          //logHandler.log(error);
        })
    } catch (error) {
      this.logHandler.log(`Erro inesperado: ${error}`)
    }
  }
}

import { Message } from 'discord.js'
import { inject, injectable } from 'inversify'

import { LogHandler } from '../../handlers'
import { TYPES } from '../../types'
import BotComandDesconectar from './desconectar.usecase'

@injectable()
export default class BotComandStop implements BotComands {
  private logHandler: LogHandler
  private botDesconectar: BotComandDesconectar
  constructor(
    @inject(TYPES.LogHandler) logHandler: LogHandler,
    @inject(TYPES.BotComandDesconectar) botDesconectar: BotComandDesconectar,
  ) {
    this.logHandler = logHandler
    this.botDesconectar = botDesconectar
  }

  /**
   *
   * @param {*} message
   * @param {*} serverQueue
   * @returns
   */
  public execute = async (message: any, serverQueue: any) => {
    if (!message.member.voice.channel)
      return message.reply(
        'Você precisar está em um canal de voz para reproduzir musicas!',
      )
    if (!serverQueue) return message.reply('Não há musica para ser pausada!')
    serverQueue.songs = []
    try {
      serverQueue.connection.dispatcher.destroy()
      this.botDesconectar.execute(message)
    } catch (error) {
      this.logHandler.log(error)
    }
  }
}

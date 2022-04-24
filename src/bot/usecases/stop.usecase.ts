import { Message } from 'discord.js'
import { inject, injectable } from 'inversify'
import { LogHandler } from '../../handlers'
import { TYPES } from '../../types'
import { BotComands, SongQueue } from '../interfaces'
import BotComandDesconectar from './desconectar.usecase'

@injectable()
export default class BotComandStop implements BotComands {
  private logHandler: LogHandler
  private botDesconectar: BotComandDesconectar
  private songQueue: Map<string, SongQueue>
  constructor(
    @inject(TYPES.SongQueue) songQueue: Map<string, SongQueue>,
    @inject(TYPES.LogHandler) logHandler: LogHandler,
    @inject(TYPES.BotComanddesconectar) botDesconectar: BotComandDesconectar,
  ) {
    this.logHandler = logHandler
    this.botDesconectar = botDesconectar
    this.songQueue = songQueue
  }

  /**
   *
   * @param {*} message
   * @returns
   */
  public execute = async (message: Message) => {
    try {
      const serverQueue = this.songQueue.get(message.guild.id)
      if (!message.member.voice.channel)
        return message.reply(
          'Você precisar está em um canal de voz para reproduzir musicas!',
        )
      if (!serverQueue) return message.reply('Não há musica para ser pausada!')
      serverQueue.songs = []
      try {
        serverQueue.connection.dispatcher.destroy()
        return this.botDesconectar.execute(message)
      } catch (error) {
        this.logHandler.log(error)
      }
    } catch (error) {
      return this.logHandler.errorLog(error, message)
    }
  }
}

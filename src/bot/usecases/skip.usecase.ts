import { Message } from 'discord.js'
import { inject, injectable } from 'inversify'
import { LogHandler } from '../../handlers'
import { TYPES } from '../../types'
import MusicHandler from '../handlers/music.handler'
import { BotComands, SongQueue } from '../interfaces'

@injectable()
export default class BotComandStop implements BotComands {
  private logHandler: LogHandler
  private musicHandler: MusicHandler
  private songQueue: Map<string, SongQueue>
  constructor(
    @inject(TYPES.SongQueue) songQueue: Map<string, SongQueue>,
    @inject(TYPES.LogHandler) logHandler: LogHandler,
    @inject(TYPES.MusicHandler) musicHandler: MusicHandler,
  ) {
    this.songQueue = songQueue
    this.logHandler = logHandler
    this.musicHandler = musicHandler
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
      if (!serverQueue) return message.reply('Não há musica para ser pulada!')
      serverQueue.connection.dispatcher.destroy()
      this.musicHandler.proximaMusica(message)
    } catch (error) {
      this.logHandler.log(`Erro inesperado: ${error}`)
      return message.reply('Erro inesperado')
    }
  }
}

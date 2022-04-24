import { Message } from 'discord.js'
import { inject, injectable } from 'inversify'
import { LogHandler } from '../../handlers'
import { TYPES } from '../../types'
import { BotComands, Song, SongQueue } from '../interfaces'

@injectable()
export default class BotComandListarMusicas implements BotComands {
  private logHandler: LogHandler
  private songQueue: Map<string, SongQueue>
  constructor(
    @inject(TYPES.LogHandler) logHandler: LogHandler,
    @inject(TYPES.SongQueue) songQueue: Map<string, SongQueue>,
  ) {
    this.logHandler = logHandler
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
      const defaultMessage = 'Nenhuma música na fila'
      if (!serverQueue || serverQueue.songs?.length === 0)
        return message.reply(defaultMessage)

      let listaMusicas = '\n '
      serverQueue.songs.forEach((element: Song, index: number) => {
        listaMusicas += `${index + 1} : ${element.title}\n`
      })
      return message.reply(`${listaMusicas}`)
    } catch (error) {
      return this.logHandler.errorLog(error, message)
    }
  }
}

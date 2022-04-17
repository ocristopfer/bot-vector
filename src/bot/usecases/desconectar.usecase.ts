import { Message } from 'discord.js'
import { inject, injectable } from 'inversify'
import { LogHandler } from '../../handlers'
import { TYPES } from '../../types'
import { BotComands } from '../interfaces'

@injectable()
export default class BotComandDesconectar implements BotComands {
  private logHandler: LogHandler
  private SongQueue: Map<any, any>
  constructor(
    @inject(TYPES.SongQueue) SongQueue: Map<any, any>,
    @inject(TYPES.LogHandler) logHandler: LogHandler,
  ) {
    this.SongQueue = SongQueue
    this.logHandler = logHandler
  }

  public execute = (message: Message) => {
    try {
      const guild = message.guild
      const songQueue = this.SongQueue.get(guild.id)
      if (songQueue != undefined) {
        songQueue.voiceChannel.leave()
        this.SongQueue.delete(guild.id)
      }
    } catch (error) {
      this.logHandler.log(`Erro inesperado: ${error}`)
      return message.reply('Erro inesperado')
    }
  }
}

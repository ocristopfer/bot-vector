import { Message } from 'discord.js'
import { inject, injectable } from 'inversify'
import { LogHandler } from '../../handlers'
import { TYPES } from '../../types'
import { BotComands, SongQueue } from '../interfaces'

@injectable()
export default class BotComandDesconectar implements BotComands {
  private logHandler: LogHandler
  private SongQueue: Map<string, SongQueue>
  constructor(
    @inject(TYPES.SongQueue) SongQueue: Map<string, SongQueue>,
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
      return this.logHandler.errorLog(error, message)
    }
  }
}

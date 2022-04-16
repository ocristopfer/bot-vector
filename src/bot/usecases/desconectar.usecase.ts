import { Client, Message } from 'discord.js'
import { inject, injectable } from 'inversify'
import { LogHandler } from '../../handlers'
import { TYPES } from '../../types'

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
      const guild = message.guild != undefined ? message.guild : message
      const serverQueue = this.SongQueue.get(guild.id)
      if (serverQueue != undefined) {
        serverQueue.voiceChannel.leave()
        this.SongQueue.delete(guild.id)
      }
      return
    } catch (error) {
      this.logHandler.log(`Erro inesperado: ${error}`)
      return message.reply('Erro inesperado')
    }
  }
}

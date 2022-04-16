import { Client, Message } from 'discord.js'
import { inject, injectable } from 'inversify'
import { TYPES } from '../../types'

@injectable()
export default class BotComandDesconectar implements BotComands {
  private SongQueue: Map<any, any>
  constructor(@inject(TYPES.SongQueue) SongQueue: Map<any, any>) {
    this.SongQueue = SongQueue
  }

  public execute = (message: Message) => {
    const guild = message.guild != undefined ? message.guild : message
    const serverQueue = this.SongQueue.get(guild.id)
    if (serverQueue != undefined) {
      serverQueue.voiceChannel.leave()
      this.SongQueue.delete(guild.id)
    }
    return
  }
}

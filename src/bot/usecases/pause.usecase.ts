import { Message } from 'discord.js'
import { inject, injectable } from 'inversify'
import { LogHandler } from '../../handlers'
import { TYPES } from '../../types'
import { BotComands, SongQueue } from '../interfaces'

@injectable()
export default class BotComandPause implements BotComands {
  private logHandler: LogHandler
  private songQueue: Map<string, SongQueue>
  constructor(
    @inject(TYPES.SongQueue) songQueue: Map<string, SongQueue>,
    @inject(TYPES.LogHandler) logHandler: LogHandler,
  ) {
    this.songQueue = songQueue
    this.logHandler = logHandler
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
      await serverQueue.connection.dispatcher.pause()
      return message.reply(`Música ${serverQueue.songs[0].title} pausada!`)
    } catch (error) {
      return this.logHandler.errorLog(error, message)
    }
  }
}

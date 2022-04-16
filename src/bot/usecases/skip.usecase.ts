import { Message } from 'discord.js'
import { inject, injectable } from 'inversify'
import { LogHandler } from '../../handlers'
import { TYPES } from '../../types'
import MusicHandler from '../handlers/music.handler'

@injectable()
export default class BotComandStop implements BotComands {
  private logHandler: LogHandler
  private musicHandler: MusicHandler
  constructor(
    @inject(TYPES.LogHandler) logHandler: LogHandler,
    @inject(TYPES.MusicHandler) musicHandler: MusicHandler,
  ) {
    this.logHandler = logHandler
    this.musicHandler = musicHandler
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
    if (!serverQueue) return message.reply('Não há musica para ser pulada!')
    serverQueue.connection.dispatcher.destroy()
    this.musicHandler.proximaMusica(message.guild, serverQueue)
  }
}

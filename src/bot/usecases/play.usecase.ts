import { Message } from 'discord.js'
import { inject, injectable } from 'inversify'
import { LogHandler } from '../../handlers'
import { TYPES } from '../../types'
import MusicHandler from '../handlers/music.handler'
import { BotComands } from '../interfaces'
import { YouTubeService } from '../services'

@injectable()
export default class BotComandPlay implements BotComands {
  private logHandler: LogHandler
  private musicHandler: MusicHandler
  private youTubeService: YouTubeService
  constructor(
    @inject(TYPES.LogHandler) logHandler: LogHandler,
    @inject(TYPES.YouTubeService) youTubeService: YouTubeService,
    @inject(TYPES.MusicHandler) musicHandler: MusicHandler,
  ) {
    this.logHandler = logHandler
    this.musicHandler = musicHandler
    this.youTubeService = youTubeService
  }

  /**
   *
   * @param {*} message
   * @returns
   */
  public execute = async (message: Message) => {
    try {
      const valorInformado: string = message.content
        .split(' ')
        .splice(1)
        .join(' ')
      const lstValorInformado = valorInformado.split(',')
      if (lstValorInformado.length > 0) {
        this.musicHandler.addListaAFila(message, lstValorInformado)
      } else {
        this.musicHandler.validarEAdicionarMusica(message, valorInformado)
      }
    } catch (error) {
      return this.logHandler.errorLog(error, message)
    }
  }
}

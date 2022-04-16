import { Message } from 'discord.js'
import { inject, injectable } from 'inversify'
import { LogHandler } from '../../handlers'
import { TYPES } from '../../types'
import MusicHandler from '../handlers/music.handler'
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
  public execute = async (message: any) => {
    let valorInformado = message.content.split(' ').splice(1).join(' ')

    if (valorInformado === '') {
      return message.reply(
        'Informe o nome ou a url do video a ser reproduzido!',
      )
    }

    if (valorInformado.substring(0, 4) !== 'http') {
      valorInformado = await this.youTubeService.buscarYouTubeNoApi(
        valorInformado,
      )
    }
    return this.musicHandler.getVideoInfo(message, valorInformado)
  }
}

import { Message } from 'discord.js'
import { inject, injectable } from 'inversify'
import { LogHandler } from '../../handlers'
import { TYPES } from '../../types'
import MusicHandler from '../handlers/music.handler'
import { BotComands } from '../interfaces'
import { YouTubeService } from '../services'
import ValidHttpURL from '../util/valid.http.url'

@injectable()
export default class BotComandPlayList implements BotComands {
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
      const comandoInformado: string = message.content
        .split(' ')
        .splice(1)
        .join(' ')

      let listId = comandoInformado
      if (ValidHttpURL.IsUrl(listId)) {
        listId = new URL(listId).searchParams.get('list')
      }
      const lstUrl = await this.youTubeService.buscarYouTubeApiPlayList(
        listId,
        20,
      )
      if (lstUrl) {
        return this.musicHandler.addListaAFila(message, lstUrl)
      }
    } catch (error) {
      return this.logHandler.errorLog(error, message)
    }
  }
}

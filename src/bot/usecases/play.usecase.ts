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
        this.addListaAFila(message, lstValorInformado)
      } else {
        this.validarEAdicionarMusica(message, valorInformado)
      }
    } catch (error) {
      this.logHandler.log(`Erro inesperado: ${error}`)
      return message.reply('Erro inesperado')
    }
  }

  private addListaAFila = async (
    message: Message,
    lstValorInformado: Array<string>,
  ) => {
    if (lstValorInformado.length > 0) {
      const valorInformado = lstValorInformado[0]
      this.validarEAdicionarMusica(message, valorInformado)
        .then(() => {
          lstValorInformado.shift()
          if (lstValorInformado.length > 0) {
            this.addListaAFila(message, lstValorInformado)
          }
        })
        .catch((error) => {
          this.logHandler.log(`Erro inesperado: ${error}`)
          return message.reply('Erro inesperado')
        })
    }
  }

  private validarEAdicionarMusica = async (
    message: Message,
    valorInformado: string,
  ) => {
    if (valorInformado === '') {
      return message.reply(
        'Informe o nome ou a url do video a ser reproduzido!',
      )
    }
    const voiceChannel = message.member.voice.channel
    if (!voiceChannel)
      return message.reply(
        'Você precisar está em um canal de voz para reproduzir musicas!',
      )
    const permissions = voiceChannel.permissionsFor(message.client.user)
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
      return message.reply(
        'I need the permissions to join and speak in your voice channel!',
      )
    }

    if (valorInformado.substring(0, 4) !== 'http') {
      return this.youTubeService
        .buscarYouTubeNoApi(valorInformado)
        .then((valorInformado) => {
          return this.musicHandler.addMusicaNaFila(message, valorInformado)
        })
        .catch((error) => {
          this.logHandler.log(`Erro inesperado: ${error}`)
          return message.reply('Erro inesperado')
        })
    } else {
      return this.musicHandler.addMusicaNaFila(message, valorInformado)
    }
  }
}

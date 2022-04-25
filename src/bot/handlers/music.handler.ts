import ytdl from 'ytdl-core'
import { Message } from 'discord.js'
import { inject, injectable } from 'inversify'
import { TYPES } from '../../types'
import LogHandler from '../../handlers/log.handler'
import { BotComandDesconectar } from '../usecases/index'
import { Song, SongQueue } from '../interfaces'
import { YouTubeService } from '../services'
import ValidHttpURL from '../util/valid.http.url'

@injectable()
export default class MusicHandler {
  private songQueue: Map<string, SongQueue>
  private logHandler: LogHandler
  private botDesconectar: BotComandDesconectar
  private youTubeService: YouTubeService
  constructor(
    @inject(TYPES.SongQueue) SongQueue: Map<string, SongQueue>,
    @inject(TYPES.LogHandler) logHandler: LogHandler,
    @inject(TYPES.BotComanddesconectar) botDesconectar: BotComandDesconectar,
    @inject(TYPES.YouTubeService) youTubeService: YouTubeService,
  ) {
    this.songQueue = SongQueue
    this.logHandler = logHandler
    this.botDesconectar = botDesconectar
    this.youTubeService = youTubeService
  }

  /**
   *
   * @param message
   * @param url
   * @returns
   */
  public addMusicaNaFila = (message: Message, url: string) => {
    return this.getVideoInfo(message, url)
  }
  /**
   *
   * @param {*} message
   * @param {*} url
   */
  private getVideoInfo = async (message: Message, url: string) => {
    return ytdl.getInfo(url).then(
      (songInfo) => {
        const songQueue = this.songQueue.get(message.guild.id)
        return this.prepararMusica(message, songQueue, songInfo)
      },
      (err) => {
        this.logHandler.log(err)
        return message.reply('Erro ao tentar buscar video')
      },
    )
  }

  /**
   *
   * @param message
   * @param songQueue
   * @param songInfo
   * @returns
   */
  private prepararMusica = async (
    message: Message,
    songQueue: SongQueue,
    songInfo: any,
  ) => {
    const voiceChannel = message.member.voice.channel
    const song: Song = {
      title: songInfo.videoDetails.title,
      url: songInfo.videoDetails.video_url,
    }

    if (!songQueue) {
      const songQueue: SongQueue = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        connection2: null,
        songs: [song],
        volume: 5,
        playing: true,
      }

      this.songQueue.set(message.guild.id, songQueue)

      try {
        songQueue.connection = await voiceChannel.join()
        message.reply(`Reproduzindo: ${song.title}!`)
        this.logHandler.log(`Reproduzindo: ${song.title}!`)
        this.tocarMusica(message, songQueue.songs[0])
      } catch (err) {
        this.logHandler.log(err)
        this.songQueue.delete(message.guild.id)
        return message.reply(err)
      }
    } else {
      songQueue.songs.push(song)
      this.logHandler.log(`${song.title} foi adicionado a fila!`)
      return message.reply(`${song.title} foi adicionado a fila!`)
    }
  }

  /**
   *
   * @param message
   * @param song
   * @returns
   */
  private tocarMusica = async (message: Message, song: Song) => {
    const guild = message.guild
    const serverQueue = this.songQueue.get(guild.id)
    if (!song) {
      return this.botDesconectar.execute(message)
    } else {
      const stream = await ytdl(song.url, {
        filter: 'audioonly',
        quality: 'highestaudio',
        highWaterMark: 1 << 25,
      })

      const dispatcher = serverQueue.connection
        .play(stream)
        .on('finish', () => {
          this.musicaEncerrada(message, song)
        })
        .on('end', () => {
          this.musicaEncerrada(message, song)
        })
        .on('error', (error) => {
          this.logHandler.log(error)
          this.proximaMusica(message)
        })

      dispatcher.setVolumeLogarithmic(serverQueue.volume / 5)
    }
  }

  private musicaEncerrada = (message: Message, song: Song) => {
    this.logHandler.log(`Musica ${song.title} encerrada!`)
    this.proximaMusica(message)
  }

  /**
   *
   * @param message
   */
  public proximaMusica = async (message: Message) => {
    const guild = message.guild
    const songQueue: SongQueue = this.songQueue.get(guild.id)
    if (songQueue.songs.length > 0) {
      songQueue.songs.shift()
      this.tocarMusica(message, songQueue.songs[0])
    } else {
      this.botDesconectar.execute(message)
    }
  }

  public addListaAFila = async (
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

  public validarEAdicionarMusica = async (
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

    if (!ValidHttpURL.IsUrl(valorInformado)) {
      return this.youTubeService
        .buscarYouTubeNoApi(valorInformado)
        .then((valorInformado) => {
          if (valorInformado)
            return this.addMusicaNaFila(message, valorInformado)
        })
        .catch((error) => {
          this.logHandler.log(`Erro inesperado: ${error}`)
          return message.reply('Erro inesperado')
        })
    } else {
      return this.addMusicaNaFila(message, valorInformado)
    }
  }
}

import * as ytdl from 'ytdl-core'
import { Message } from 'discord.js'
import { inject, injectable } from 'inversify'
import { TYPES } from '../../types.js'
import LogHandler from '../../handlers/log.handler.js'
import { BotComandDesconectar } from '../usecases/index'

@injectable()
export default class MusicHandler {
  private queue: any
  private ytdl: any
  private logHandler: LogHandler
  private botDesconectar: BotComandDesconectar
  constructor(
    @inject(TYPES.SongQueue) SongQueue: Map<any, any>,
    @inject(TYPES.LogHandler) logHandler: LogHandler,
    @inject(TYPES.BotComanddesconectar) botDesconectar: BotComandDesconectar,
  ) {
    this.queue = SongQueue
    this.ytdl = ytdl
    this.logHandler = logHandler
    this.botDesconectar = botDesconectar
  }

  /**
   *
   * @param {*} message
   * @param {*} url
   */
  getVideoInfo = async (message: Message, url: any) => {
    const serverQueue = this.queue.get(message.guild.id)
    this.ytdl.getInfo(url).then(
      (songInfo) => {
        this.prepararMusica(message, serverQueue, songInfo)
      },
      (err) => {
        this.logHandler.log(err)
        return message.reply('Erro ao tentar buscar video')
      },
    )
  }

  /**
   *
   * @param {*} message
   * @param {*} serverQueue
   * @param {*} songInfo
   * @returns
   */
  prepararMusica = async (message: any, serverQueue: any, songInfo: any) => {
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

    const song = {
      title: songInfo.videoDetails.title,
      url: songInfo.videoDetails.video_url,
    }

    if (!serverQueue) {
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true,
      }

      this.queue.set(message.guild.id, queueContruct)

      queueContruct.songs.push(song)

      try {
        var connection = await voiceChannel.join()
        queueContruct.connection = connection
        message.reply(`Reproduzindo: ${song.title}!`)
        this.logHandler.log(`Reproduzindo: ${song.title}!`)
        this.tocarMusica(message.guild, queueContruct.songs[0])
      } catch (err) {
        this.logHandler.log(err)
        this.queue.delete(message.guild.id)
        return message.reply(err)
      }
    } else {
      serverQueue.songs.push(song)
      this.logHandler.log(`${song.title} foi adicionado a fila!`)
      return message.reply(`${song.title} foi adicionado a fila!`)
    }
  }

  /**
   *
   * @param {*} guild
   * @param {*} song
   * @returns
   */
  tocarMusica = async (guild: any, song: any) => {
    const serverQueue = this.queue.get(guild.id)
    if (!song) {
      this.botDesconectar.execute(guild)
      return
    } else {
      const dispatcher = serverQueue.connection
        .play(
          await ytdl(song.url, {
            filter: 'audioonly',
            quality: 'highestaudio',
            highWaterMark: 1 << 25,
          }),
        )
        .on('finish', () => {
          this.logHandler.log(`Musica ${song.title} encerrada!`)
          this.proximaMusica(guild, serverQueue)
        })
        .on('end', () => {
          this.logHandler.log(`Musica ${song.title} encerrada!`)
          this.proximaMusica(guild, serverQueue)
        })
        .on('error', (error) => {
          this.logHandler.log(error)
          this.proximaMusica(guild, serverQueue)
        })
      dispatcher.setVolumeLogarithmic(serverQueue.volume / 5)
    }
  }

  /**
   *
   * @param {*} guild
   * @param {*} serverQueue
   */
  proximaMusica = async (guild: any, serverQueue: any) => {
    serverQueue.songs.shift()
    this.tocarMusica(guild, serverQueue.songs[0])
  }
}

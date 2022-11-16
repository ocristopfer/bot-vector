import { Message } from 'discord.js'
import { inject, injectable } from 'inversify'
import { LogHandler } from '../../handlers'
import { TYPES } from '../../types'
import { BotComands, SongQueue } from '../interfaces'
import {
  DiscordGatewayAdapterCreator,
  joinVoiceChannel,
} from '@discordjs/voice'

@injectable()
export default class BotComandListen implements BotComands {
  private logHandler: LogHandler
  private SongQueue: Map<string, SongQueue>

  constructor(
    @inject(TYPES.SongQueue) SongQueue: Map<string, SongQueue>,
    @inject(TYPES.LogHandler) logHandler: LogHandler,
  ) {
    this.SongQueue = SongQueue
    this.logHandler = logHandler
  }

  public execute = async (message: Message) => {
    //Desabilitando voice recording
    return
    // try {
    //   const guild = message.guild
    //   let songQueue = this.SongQueue.get(guild.id)
    //   const voiceChannel = message.member.voice.channel
    //   if (!songQueue) {
    //     songQueue = {
    //       textChannel: message.channel,
    //       voiceChannel: voiceChannel,
    //       connection: null,
    //       connection2: null,
    //       songs: [],
    //       volume: 5,
    //       playing: true,
    //     }

    //     this.SongQueue.set(message.guild.id, songQueue)
    //     songQueue.connection = joinVoiceChannel({
    //       channelId: message.channel.id,
    //       guildId: guild.id,
    //       adapterCreator:
    //         guild.voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator,
    //     })
    //   }
    //   if (songQueue.connection2 == null) {
    //     songQueue.connection2 = await voiceChannel.join()
    //   }
    //   message.reply(`Escutando audo do canal ${guild}`)
    // } catch (error) {
    //   return this.logHandler.errorLog(error, message)
    // }
  }
}

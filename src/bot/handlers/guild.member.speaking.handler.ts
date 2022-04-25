import { Leopard } from '@picovoice/leopard-node'
import { inject, injectable } from 'inversify'
import path from 'path'
import { TYPES } from '../../types'
import { SongQueue } from '../interfaces'
import * as fs from 'fs'
import ffmpeg from 'fluent-ffmpeg'
import { TextChannel } from 'discord.js'

@injectable()
export default class GuildMemberSpeakingHandler {
  private appRoot: string
  private songQueue: Map<string, SongQueue>
  constructor(
    @inject(TYPES.AppRoot) appRoot: string,
    @inject(TYPES.SongQueue) songQueue: Map<string, SongQueue>,
  ) {
    this.appRoot = appRoot
    this.songQueue = songQueue
  }
  public handler = async (member, speaking) => {
    try {
      if (speaking.has('SPEAKING')) {
        let songQueue = this.songQueue.get(member.guild.id)
        const audio = songQueue.connection2.receiver.createStream(member, {
          mode: 'pcm',
          end: 'silence',
        })
        audio.pipe(
          fs.createWriteStream(
            path.resolve(`${this.appRoot}/user_audio${member.guild.id}.pcm`),
          ),
        )

        const accessKey = process.env.PICOVOICE_KEY // Obtained from the Picovoice Console (https://console.picovoice.ai/)
        const handle = new Leopard(accessKey)

        this.convertPCM(
          path.resolve(`${this.appRoot}/user_audio${member.guild.id}.pcm`),
          `${this.appRoot}/user_audio${member.guild.id}.wav`,
        )
          .then(() => {
            let words = handle.processFile(
              path.resolve(`${this.appRoot}/user_audio${member.guild.id}.wav`),
            )
            if (words.length > 0) {
              member.guild.channels.cache
                .filter(
                  (channel: TextChannel) =>
                    channel.name === 'chat' || channel.name === 'geral',
                )
                .first()
                .send('Você falou: ' + words)
            }

            console.log('Você falou: ' + words)
          })
          .catch((error) => {
            console.error(error)
          })
      }
    } catch (error) {
      console.error(error)
    }
  }

  private convertPCM = async (input, dest) => {
    const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
    ffmpeg.setFfmpegPath(ffmpegPath)
    await new Promise((resolve, reject) => {
      ffmpeg(input)
        .inputOptions(['-f', 's16le', '-ar', '48k', '-ac', '2'])
        .save(dest)
        .on('end', (data) => resolve(data))
        .on('error', (error) => reject(error))
    })
  }
}

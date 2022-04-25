import { Song } from '.'

export interface SongQueue {
  textChannel: any
  voiceChannel: any
  connection: any
  connection2: any
  songs: Song[]
  volume: number
  playing: boolean
}

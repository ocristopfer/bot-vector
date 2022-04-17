import { Song } from '.'

export interface SongQueue {
  textChannel: any
  voiceChannel: any
  connection: any
  songs: Song[]
  volume: number
  playing: boolean
}

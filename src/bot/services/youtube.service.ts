import * as http from 'http'
import * as https from 'https'
import { inject, injectable } from 'inversify'
import { YoutubeDataAPI } from 'youtube-v3-api'

import { LogHandler } from '../../handlers'
import { TYPES } from '../../types'

@injectable()
export default class YouTubeService {
  private youTubeUrl = 'https://www.youtube.com'
  private logHandler: LogHandler
  constructor(@inject(TYPES.LogHandler) logHandler: LogHandler) {
    this.logHandler = logHandler
  }
  /**
   * Faz a busca na pagina.
   * @param {*} url
   * @returns string
   */
  private getScript = async (url: string) => {
    return new Promise((resolve, reject) => {
      let client = null

      if (url.toString().indexOf('https') === 0) {
        client = https
      } else {
        client = http
      }

      client
        .get(url, (resp: any) => {
          let data = ''

          // A chunk of data has been recieved.
          resp.on('data', (chunk) => {
            data += chunk
          })

          // The whole response has been received. Print out the result.
          resp.on('end', () => {
            resolve(data)
          })
        })
        .on('error', (error: any) => {
          this.logHandler.errorLog(error, null)
          reject(error)
        })
    })
  }

  /**
   * Chama a função de carregar a pagina passando o argumento de busca para conseguir captura o id do video.
   * @param {*} args
   * @returns string
   */
  public buscarYouTubeNoApi = async (args: string) => {
    return await this.getScript(
      `${this.youTubeUrl}/results?search_query=${args.replace(/\s/g, '+')}`,
    )
      .then((resolve) => {
        const idVideo = resolve.toString().match(/.watch.v=[^"]*/gm)[0]
        return `${this.youTubeUrl}${idVideo}`
      })
      .catch((error) => {
        return this.logHandler.errorLog(error, null)
      })
  }

  /**
   * Busca playlist diretamente na api do youtube e retorna as urls dos videos.
   * @param playListId
   * @param maxResults
   * @returns
   */
  public buscarYouTubeApiPlayList = async (
    playListId: string,
    maxResults: number,
  ) => {
    const youtubeDataAPI = new YoutubeDataAPI(process.env.YOUTUBEAPI)
    return youtubeDataAPI
      .searchPlaylistItems(playListId, maxResults)
      .then((result: any) => {
        const lstUrl: Array<string> = []
        result.items.forEach((youTubeVideo) => {
          lstUrl.push(
            this.youTubeUrl + '/watch?v=' + youTubeVideo.contentDetails.videoId,
          )
        })
        return lstUrl
      })
      .catch((error) => {
        return this.logHandler.errorLog(error, null)
      })
  }
}

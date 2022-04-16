import * as http from 'http'
import * as https from 'https'
import { inject, injectable } from 'inversify'
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
  getScript = async (url: any) => {
    return new Promise((resolve, reject) => {
      let client = null

      if (url.toString().indexOf('https') === 0) {
        client = https
      } else {
        client = http
      }

      client
        .get(url, (resp) => {
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
        .on('error', (error) => {
          this.logHandler.log(`Erro inesperado: ${error}`)
          reject(error)
        })
    })
  }

  /**
   * Chama a função de carregar a pagina passando o argumento de busca para conseguir captura o id do video.
   * @param {*} args
   * @returns string
   */
  buscarYouTubeNoApi = async (args: any) => {
    return await this.getScript(
      `${this.youTubeUrl}/results?search_query=${args.replace(/\s/g, '+')}`,
    )
      .then((resolve) => {
        var idVideo = resolve.toString().match(/.watch.v=[^"]*/gm)[0]
        return `${this.youTubeUrl}${idVideo}`
      })
      .catch((error) => {
        this.logHandler.log(`Erro inesperado: ${error}`)
        return ''
      })
  }
}

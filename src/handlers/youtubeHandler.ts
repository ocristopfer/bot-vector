import * as http from 'http'
import * as https from 'https'
import { injectable } from 'inversify'
@injectable()
export default class YouTubeHandler {
  /**
   * Faz a busca na pagina.
   * @param {*} url
   * @returns promisse
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
        .on('error', (err) => {
          reject(err)
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
      'https://www.youtube.com/results?search_query=' +
        args.replace(/\s/g, '+'),
    )
      .then((resolve) => {
        var idVideo = resolve.toString().match(/.watch.v=[^"]*/gm)[0]
        return `https://www.youtube.com${idVideo}`
      })
      .catch((erro) => {
        console.log(erro)
      })
  }
}

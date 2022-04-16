import { Message } from 'discord.js'
import { inject, injectable } from 'inversify'
import { LogHandler } from '../../handlers'
import { TYPES } from '../../types'

@injectable()
export default class BotComandListarMusicas implements BotComands {
  private logHandler: LogHandler
  constructor(@inject(TYPES.LogHandler) logHandler: LogHandler) {
    this.logHandler = logHandler
  }

  /**
   *
   * @param {*} message
   * @param {*} serverQueue
   * @returns
   */
  public execute = async (message: Message, serverQueue: any) => {
    if (serverQueue) {
      if (serverQueue.songs.length > 0) {
        let listaMusicas = ' \n '
        let contador = 1
        serverQueue.songs.forEach((element) => {
          listaMusicas += contador + ' : ' + element.title + ' \n '
          contador += 1
        })
        return message.reply(`${listaMusicas}`)
      } else {
        return message.reply('Nenhuma música na fila')
      }
    }
  }
}

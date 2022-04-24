import { Message } from 'discord.js'
import { inject, injectable } from 'inversify'
import { TYPES } from '../../types'
import container from './../../inversify.config'
import { LogHandler } from '../../handlers'
import { BotComands } from '../interfaces'

@injectable()
export default class BotComandsHandler {
  private prefix: string
  private logHandler: LogHandler
  constructor(
    @inject(TYPES.Prefix) prefix: string,
    @inject(TYPES.LogHandler)
    logHandler: LogHandler,
  ) {
    this.prefix = prefix
    this.logHandler = logHandler
  }

  /**
   *
   * @param message
   * @returns
   */
  public handle = async (message: Message) => {
    let messageContent = message.content.toLocaleLowerCase()
    if (message.author.bot) return
    if (!messageContent.startsWith(this.prefix)) return
    this.logHandler.log(`Comando executado: ${messageContent}`)
    try {
      messageContent = messageContent.split(' ')[0].slice(1)
      const useCase = container.get<BotComands>(
        TYPES[`BotComand${messageContent}`],
      )
      useCase.execute(message)
    } catch (error) {
      this.logHandler.log(`Erro ao executar comando, erro: ${error}`)
      message.reply('Comando não encontrado')
    }
  }
}

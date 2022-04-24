import { Message } from 'discord.js'
import { inject, injectable } from 'inversify'
import { LogHandler } from '../../handlers'
import { TYPES } from '../../types'
import { BotComands } from '../interfaces'

@injectable()
export default class BotComandExit implements BotComands {
  private logHandler: LogHandler
  constructor(@inject(TYPES.LogHandler) logHandler: LogHandler) {
    this.logHandler = logHandler
  }

  public execute = async (message: Message) => {
    try {
      this.logHandler.log('Encerrando o bot')
      if (message.author.id === '220610573853917186') {
        message
          .reply('O bot foi encerrado!')
          .then(() => {
            return process.exit(22)
          })
          .catch()
      }
    } catch (error) {
      return this.logHandler.errorLog(error, message)
    }
  }
}

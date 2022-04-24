import { inject, injectable } from 'inversify'
import { LogHandler } from '../../handlers'
import { TYPES } from '../../types'
import { BotComands } from '../interfaces'

@injectable()
export default class BotComandClearChat implements BotComands {
  private logHandler: LogHandler
  constructor(@inject(TYPES.LogHandler) logHandler: LogHandler) {
    this.logHandler = logHandler
  }

  public execute = async (message: any) => {
    try {
      if (!message.member.hasPermission('ADMINISTRATOR')) {
        return message.reply('Não tem permissão para executar esse comando!')
      }

      try {
        message.delete()
        const fetched = await message.channel.fetchMessages({
          limit: 99,
        })
        message.channel
          .bulkDelete(fetched)
          .then(() => {
            message.reply('Efetuada a limpeza do chat!')
          })
          .catch((error: any) => {
            return this.logHandler.errorLog(error, message)
          })
      } catch (error) {
        return this.logHandler.errorLog(error, message)
      }
    } catch (error) {
      return this.logHandler.errorLog(error, message)
    }
  }
}

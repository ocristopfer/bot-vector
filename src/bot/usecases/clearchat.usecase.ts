import { inject, injectable } from 'inversify'
import { LogHandler } from '../../handlers'
import { TYPES } from '../../types'

@injectable()
export default class BotComandClearChat implements BotComands {
  private logHandler: LogHandler
  constructor(@inject(TYPES.LogHandler) logHandler: LogHandler) {
    this.logHandler = logHandler
  }

  public execute = async (message: any) => {
    if (!message.member.hasPermission('ADMINISTRATOR')) {
      return
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
        .catch((erro: any) => {
          this.logHandler.log(erro)
        })
    } catch (error) {
      this.logHandler.log(error)
      message.reply('Erro ao tentar limpar chat!')
    }
  }
}

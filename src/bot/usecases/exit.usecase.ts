import { Message } from 'discord.js'
import { injectable } from 'inversify'

@injectable()
export default class BotComandExit implements BotComands {
  constructor() {}

  public execute = async (message: Message) => {
    if (message.author.id === '220610573853917186') {
      message
        .reply('O bot foi encerrado!')
        .then(() => {
          return process.exit(22)
        })
        .catch()
    }
  }
}

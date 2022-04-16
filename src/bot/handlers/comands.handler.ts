import { Client, Message } from 'discord.js'
import { inject, injectable } from 'inversify'
import { BotComandDesconectar, BotComandPing } from '../usecases'
import { TYPES } from '../../types'
import container from './../../inversify.config'

@injectable()
export default class BotComandsHandler {
  private prefix: string
  private botComandDesconectar: BotComandDesconectar
  private botComandPing: BotComandPing
  constructor(
    @inject(TYPES.Prefix) prefix: string,
    @inject(TYPES.BotComandDesconectar)
    botComandDesconectar: BotComandDesconectar,
    @inject(TYPES.BotComandPing)
    botComandPing: BotComandPing,
  ) {
    this.prefix = prefix
    this.botComandDesconectar = botComandDesconectar
    this.botComandPing = botComandPing
  }

  public handle = async (message: Message) => {
    let messageContent = message.content.toLocaleLowerCase()
    if (message.author.bot) return
    if (!messageContent.startsWith(this.prefix)) return
    messageContent = this.upperPrimeiraLetra(messageContent.slice(1))
    let useCase = container.get<BotComands>(TYPES[`BotComand${messageContent}`])
    console.log(useCase)
    useCase.execute(message)
  }
  private upperPrimeiraLetra = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1)
  }
}

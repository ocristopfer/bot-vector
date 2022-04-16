import { Client, Message } from 'discord.js'
import { inject, injectable } from 'inversify'
import { TYPES } from '../../types'

@injectable()
export default class BotComandPing implements BotComands {
  private botClient: Client
  constructor(@inject(TYPES.Client) botClient: Client) {
    this.botClient = botClient
  }

  public execute = async (message: Message) => {
    message.reply(
      `🏓Latency is ${
        Date.now() - message.createdTimestamp
      }ms. API Latency is ${Math.round(this.botClient.ws.ping)}ms`,
    )
  }
}

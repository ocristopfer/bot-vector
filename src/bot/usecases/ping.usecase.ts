import { Client, Message } from 'discord.js'
import { inject, injectable } from 'inversify'
import { LogHandler } from '../../handlers'
import { TYPES } from '../../types'
import { BotComands } from '../interfaces'

@injectable()
export default class BotComandPing implements BotComands {
  private botClient: Client
  private logHandler: LogHandler
  constructor(
    @inject(TYPES.Client) botClient: Client,
    @inject(TYPES.LogHandler) logHandler: LogHandler,
  ) {
    this.botClient = botClient
    this.logHandler = logHandler
  }

  public execute = async (message: Message) => {
    try {
      message.reply(
        `🏓Latency is ${
          Date.now() - message.createdTimestamp
        }ms. API Latency is ${Math.round(this.botClient.ws.ping)}ms`,
      )
    } catch (error) {
      return this.logHandler.errorLog(error, message)
    }
  }
}

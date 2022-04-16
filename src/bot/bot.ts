import { inject, injectable } from 'inversify'
import LogHandler from '../handlers/log.handler.js'
import { TYPES } from '../types.js'
import BotGateway from './bot.gateway.js'

@injectable()
export default class Bot {
  private botHandler: BotGateway
  private logHandler: LogHandler
  constructor(
    @inject(TYPES.BotGateway) botHandler: BotGateway,
    @inject(TYPES.LogHandler) logHandler: LogHandler,
  ) {
    this.botHandler = botHandler
    this.logHandler = logHandler
  }
  public init = () => {
    try {
      this.logHandler.log(`Iniciando Bot`)
      this.botHandler.init()
    } catch (error) {
      this.logHandler.log(`Erro ao iniciar bot: ${error}`)
    }
  }
}

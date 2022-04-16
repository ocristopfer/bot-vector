import { inject, injectable } from 'inversify'
import BotHandler from './handlers/botHandler.js'
import LogHandler from './handlers/logHandler.js'
import WebHandler from './handlers/webHandler.js'
import { TYPES } from './types.js'

@injectable()
export default class Bot {
  private botHandler: BotHandler
  private logHandler: LogHandler
  private webHandler: WebHandler
  constructor(
    @inject(TYPES.BotHandler) botHandler: BotHandler,
    @inject(TYPES.LogHandler) logHandler: LogHandler,
    @inject(TYPES.WebHandler) webHandler: WebHandler,
  ) {
    this.botHandler = botHandler
    this.logHandler = logHandler
    this.webHandler = webHandler
  }
  public init = () => {
    try {
      this.logHandler.log(`Inciando bot`)
      this.webHandler.init()
      this.botHandler.init()
    } catch (error) {
      this.logHandler.log(`Erro ao iniciar bot: ${error}`)
    }
  }
}

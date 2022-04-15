import BotHandler from './handlers/botHandler.js'
import LogHandler from './handlers/logHandler.js'
import WebHandler from './handlers/webHandler.js'

export default class BotIndex {
  private botHandler: BotHandler
  private logHandler: LogHandler
  private webHandler: WebHandler
  constructor() {
    this.botHandler = new BotHandler()
    this.logHandler = new LogHandler()
    this.webHandler = new WebHandler()
    this.init()
  }
  private init = () => {
    try {
      this.logHandler.log(`Inciando bot`)
      this.webHandler.init()
      this.botHandler.init()
    } catch (error) {
      this.logHandler.log(`Erro ao iniciar bot: ${error}`)
    }
  }
}

import * as express from 'express'
import * as https from 'https'
import * as path from 'path'
import LogHandler from './logHandler.js'

/**
 * Criar servidor web para funcionamento do heroku
 */
export default class WebHandler {
  private logHandler: LogHandler
  constructor() {
    this.logHandler = new LogHandler()
  }
  public init = () => {
    const app = express()
    const port = process.env.PORT || 3000

    app.get('/', (_req, res) => {
      res.sendFile(path.join(__dirname, './../public/index.html'))
    })

    app.listen(port, () => {
      this.logHandler.log('The application is listening on port 3000!')
    })

    setInterval(() => {
      https.get('https://bot-cda-cris.herokuapp.com/', (resp) => {
        this.logHandler.log('Acorda bot')
      })
    }, 300000) // every 5 minutes (300000)
  }
}

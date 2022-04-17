import express from 'express'
import * as https from 'https'
import { inject, injectable } from 'inversify'
import * as path from 'path'
import { TYPES } from '../types'
import LogHandler from '../handlers/log.handler'

/**
 * Criar servidor web para funcionamento do heroku
 */
@injectable()
export default class WebService {
  private logHandler: LogHandler
  constructor(@inject(TYPES.LogHandler) logHandler: LogHandler) {
    this.logHandler = logHandler
    this.logHandler.log('Iniciando WebService')
  }
  public init = () => {
    const app = express()
    const port = process.env.PORT || 3000

    app.get('/', (_req, res) => {
      res.sendFile(path.join(__dirname, './../public/index.html'))
    })

    app.listen(port, () => {
      this.logHandler.log('Web Service Iniciado!')
    })

    setInterval(() => {
      const urlBot = process.env.BOTURL || 'localhost:3000'
      https.get(urlBot, (resp) => {
        this.logHandler.log('Acorda bot')
      })
    }, 300000) // every 5 minutes (300000)
  }
}

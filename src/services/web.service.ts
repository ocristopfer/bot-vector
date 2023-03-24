import express from 'express'
import * as https from 'https'
import * as http from 'http'
import { inject, injectable } from 'inversify'
import * as path from 'path'
import { TYPES } from '../types'
import LogHandler from '../handlers/log.handler'
import * as url from 'url'
import fs from "fs";

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

    https.createServer( {
      key: fs.readFileSync(path.join(__dirname, './../ssl/key.pem')),
      cert: fs.readFileSync(path.join(__dirname, './../ssl/cert.pem')),
    },app).listen(port, () => {
      this.logHandler.log('Web Service Iniciado!')
    })

    setInterval(() => {
      const urlBot = process.env.BOTURL || 'http://localhost' + port
      const uri = url.parse(urlBot, true)
      if (uri.protocol === 'https:') {
        https.get(urlBot, () => {
          this.logHandler.log('Acorda bot')
        })
      } else {
        http.get(urlBot, () => {
          this.logHandler.log('Acorda bot')
        })
      }
    }, (parseInt(process.env.BOTWAKEUPTIMEOUT) || 30) * 60000)
  }
}

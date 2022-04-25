import { Message } from 'discord.js'
import * as fs from 'fs'
import { inject, injectable } from 'inversify'
import * as path from 'path'
import { TYPES } from '../types'

@injectable()
export default class LogHandler {
  private fileName: string
  private fs: typeof fs
  private logDir: string
  constructor(@inject(TYPES.AppRoot) appRoot: string) {
    this.fileName = new Date()
      .toLocaleDateString()
      .trim()
      .replace(/[^\w\s]/gi, '_')
    this.fs = fs
    this.logDir = path.resolve(`${appRoot}/logs`) || './logs'
    this.checarSeLogDirExiste()
  }

  /**
   *
   * @param {*} sLog
   */
  public log = async (sLog: string) => {
    console.log(sLog)
    sLog = new Date().toLocaleString() + ': ' + sLog
    this.abrirLogFile()
      .then((sLogFile) => {
        if (sLogFile !== null) {
          return this.salvarLogFile((sLogFile += '\n' + sLog))
        } else {
          return this.salvarLogFile(sLog)
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }

  public errorLog(execption: unknown, message: Message) {
    console.log('Erro inesperado')
    const sLog = `${new Date().toDateString()}: Erro inesperado ${execption}`
    this.abrirLogFile()
      .then((sLogFile) => {
        if (sLogFile !== null) {
          return this.salvarLogFile((sLogFile += '\n' + sLog))
        } else {
          return this.salvarLogFile(sLog)
        }
      })
      .catch((err) => {
        console.log('erro: ' + err)
      })

    if (message) {
      message.reply(sLog)
    }
  }

  private abrirLogFile() {
    return new Promise<string>((resolve, reject) => {
      this.fs.readFile(
        `${this.logDir}/${this.fileName}.txt`,
        'utf8',
        (err, data) => {
          if (err) {
            if (err.code === 'ENOENT') resolve(null)
            reject(err)
          }
          resolve(data)
        },
      )
    })
  }

  /**
   *
   * @param {*} sLog
   * @returns
   */
  private salvarLogFile = async (sLog: string) => {
    return new Promise<void>((resolve, reject) => {
      this.fs.writeFile(
        `${this.logDir}/${this.fileName}.txt`,
        sLog,
        (error) => {
          if (error) {
            reject(error)
          }
          resolve()
        },
      )
    })
  }

  private checarSeLogDirExiste = () => {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir)
    }
  }
}

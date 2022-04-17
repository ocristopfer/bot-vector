import * as fs from 'fs'
import { injectable } from 'inversify'
import * as path from 'path'

@injectable()
export default class LogHandler {
  private fileName: string
  private fs: typeof fs
  private logDir: string
  constructor() {
    this.fileName = new Date()
      .toLocaleDateString()
      .trim()
      .replace(/[^\w\s]/gi, '_')
    this.fs = fs
    this.logDir = path.resolve(`${global.appRoot}/logs`)
    this.checarSeLogDirExiste()
  }

  /**
   *
   * @param {*} sLog
   */
  public log = async (sLog: string) => {
    console.log(sLog)
    sLog = new Date().toLocaleString() + ': ' + sLog
    this.fs.readFile(
      `${this.logDir}/${this.fileName}.txt`,
      'utf8',
      (err, data) => {
        if (err) {
          return this.salvarLogFile(sLog)
        }
        return this.salvarLogFile((data += `\n${sLog}`))
      },
    )
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

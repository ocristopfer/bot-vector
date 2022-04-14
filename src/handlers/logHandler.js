import * as fs from "fs";
export default class LogHandler {
  constructor() {
    this.fileName = new Date()
      .toLocaleDateString()
      .trim()
      .replace(/[^\w\s]/gi, "_");
    this.fs = fs;
  }
  /**
   *
   * @param {*} sLog
   */
  log = async (sLog) => {
    console.log(sLog);
    sLog = new Date().toLocaleString() + ": " + sLog;
    this.fs.readFile(`./src/logs/${this.fileName}.txt`, "utf8", (err, data) => {
      if (err) {
        this.salvarLogFile(sLog);
        return;
      }
      this.salvarLogFile((data += `\n${sLog}`));
    });
  };

  /**
   *
   * @param {*} sLog
   * @returns
   */
  salvarLogFile = async (sLog) => {
    return new Promise((resolve, reject) => {
      this.fs.writeFile(
        `./src/logs/${this.fileName}.txt`,
        sLog,
        function (err) {
          if (err) {
            reject(err);
          }
          resolve();
        }
      );
    });
  };
}

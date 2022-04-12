module.exports = function (fileName) {
  const fs = require("fs");
  this.log = async (sLog) => {
    console.log(sLog);
    sLog = new Date().toLocaleString() + ": " + sLog;
    fs.readFile(`${appRoot}/logs/${fileName}.txt`, "utf8", (err, data) => {
      if (err) {
        this.salvarLogFile(sLog);
        return;
      }
      this.salvarLogFile((data += `\n${sLog}`));
    });
  };
  this.salvarLogFile = async (sLog) => {
    return new Promise((resolve, reject) => {
      fs.writeFile(`${appRoot}/logs/${fileName}.txt`, sLog, function (err) {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  };
};

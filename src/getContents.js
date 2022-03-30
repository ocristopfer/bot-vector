module.exports = {
  /**
   * Faz a busca na pagina.
   * @param {*} url
   */
  getScript: async function getScript(url) {
    return new Promise((resolve, reject) => {
      const http = require("http"),
        https = require("https");

      let client = http;

      if (url.toString().indexOf("https") === 0) {
        client = https;
      }

      client
        .get(url, (resp) => {
          let data = "";

          // A chunk of data has been recieved.
          resp.on("data", (chunk) => {
            data += chunk;
          });

          // The whole response has been received. Print out the result.
          resp.on("end", () => {
            resolve(data);
          });
        })
        .on("error", (err) => {
          reject(err);
        });
    });
  },

  /**
   * Chama a função de carregar a pagina passando o argumento de busca para conseguir captura o id do video.
   * @param {*} args
   */
  buscarYouTubeNoApi: async function buscarYouTubeNoApi(args) {
    var result = await this.getScript(
      "https://www.youtube.com/results?search_query=" + args.replace(/\s/g, '+')
    );
    var element = "";
    var capturou = false;
    for (
      index = result.indexOf("/watch?v="); index < result.indexOf("/watch?v=") + 30; index++
    ) {
      if (capturou == false) {
        if (result[index] != '"') {
          element += result[index];
        } else {
          capturou = true;
        }
      }
    }
    return "https://www.youtube.com" + element;
  },
};
module.exports = function () {
  /**
   * Faz a busca na pagina.
   * @param {*} url
   * @returns promisse
   */
  this.getScript = async (url) => {
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
  };

  /**
   * Chama a função de carregar a pagina passando o argumento de busca para conseguir captura o id do video.
   * @param {*} args
   * @returns string
   */
  this.buscarYouTubeNoApi = async (args) => {
    return await this.getScript(
      "https://www.youtube.com/results?search_query=" + args.replace(/\s/g, "+")
    )
      .then((resolve) => {
        var idVideo = resolve.match(/.watch.v=[^"]*/gm)[0];
        return `https://www.youtube.com${idVideo}`;
      })
      .catch((erro) => {
        console.log(erro);
      });
  };
};

module.exports = function (logHandler) {
  const fs = require("fs");

  const CreateConfigFile = () => {
    var fs = require("fs");
    var jsonConfig = {
      prefix: "!",
      token: "",
    };

    fs.writeFileSync(
      `${appRoot}/config.json`,
      JSON.stringify(jsonConfig),
      function (err) {
        if (err) {
          logHandler.log(err);
          return;
        }
        this.GetConfig();
      }
    );
  };

  this.GetConfig = () => {
    try {
      config = require(`${appRoot}/config.json`);
      return config;
    } catch (error) {
      CreateConfigFile();
      return;
    }
  };
};

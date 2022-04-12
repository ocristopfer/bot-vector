const Discord = require("discord.js");
const client = new Discord.Client();
const queue = new Map();
const ytdl = require("ytdl-core");
const cli = require("nodemon/lib/cli");
const getContents = new (require("./getContents.js"))();
const fileName = new Date()
  .toLocaleDateString()
  .trim()
  .replace(/[^\w\s]/gi, "_");
console.log(fileName);
const logHandler = new (require("./logHandler"))(fileName);

let config = null;
try {
  config = require("./config.json");
} catch (error) {}

//Discord events
client.once("ready", () => {
  logHandler.log("Iniciado");
});

client.once("reconnecting", () => {
  logHandler.log("Reconectando!");
});

client.once("disconnect", () => {
  logHandler.log("Desconectado!");
});

client.on("guildMembersChunk", async (member) => {
  logHandler.log("disponivel");
});

client.on("guildMemberAvailable", async (member) => {
  logHandler.log("disponivel");
});

client.on("guildMemberAdd", async (member) => {
  member.guild.channels.get("channelID").send("Bem Vindo :D");
});

client.on("voiceStateUpdate", async (oldMember, newMember) => {
  if (oldMember.channelID !== newMember.channelID) {
    usuarioMudouDeCanal(oldMember, false);
    usuarioMudouDeCanal(newMember, true);
  }
});

client.on("message", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;

  let args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  let comando = args.shift().toLocaleLowerCase();
  let serverQueue = queue.get(message.guild.id);

  try {
    Comandos.forEach((element) => {
      if (element.nome === comando) {
        element.method(message, serverQueue);
      }
    });
  } catch (error) {
    logHandler.log(comando, error);
  }
});

//Comandos
const execute = async (message, serverQueue) => {
  valorInformado = message.content.split(" ").splice(1).join(" ");

  if (valorInformado === "") {
    return message.channel.send(
      "Informe o nome ou a url do video a ser reproduzido!"
    );
  }

  if (valorInformado.substring(0, 4) !== "http") {
    valorInformado = await getContents.buscarYouTubeNoApi(valorInformado);
  }
  return getVideoInfo(message, serverQueue, valorInformado);
};

const skip = async (message, serverQueue) => {
  if (!message.member.voice.channel)
    return message.channel.send(
      "Você precisar está em um canal de voz para reproduzir musicas!"
    );
  if (!serverQueue)
    return message.channel.send("Não há musica para ser pulada!");
  serverQueue.connection.dispatcher.destroy();
  proximaMusica(message.guild, serverQueue);
};

const stop = async (message, serverQueue) => {
  if (!message.member.voice.channel)
    return message.channel.send(
      "Você precisar está em um canal de voz para reproduzir musicas!"
    );
  if (!serverQueue)
    return message.channel.send("Não há musica para ser pausada!");
  serverQueue.songs = [];
  try {
    serverQueue.connection.dispatcher.destroy();
    desconectar(message);
  } catch (error) {
    logHandler.log(error);
  }
};

const listar = async (message, serverQueue) => {
  if (serverQueue) {
    if (serverQueue.songs.length > 0) {
      listaMusicas = " \n ";
      contador = 1;
      serverQueue.songs.forEach((element) => {
        listaMusicas += contador + " : " + element.title + " \n ";
        contador += 1;
      });
      return message.channel.send(`${listaMusicas}`);
    } else {
      return message.channel.send("Nenhuma música na fila");
    }
  }
};

const desconectar = async (message, serverQueue) => {
  let guild = message.guild != undefined ? message.guild : message;
  serverQueue = queue.get(guild.id);
  if (serverQueue != undefined) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
  }
  return;
};

const clearchat = async (message, serverQueue) => {
  if (!message.member.hasPermission("ADMINISTRATOR")) {
    return;
  }

  try {
    message.delete();
    const fetched = await message.channel.fetchMessages({
      limit: 99,
    });
    message.channel
      .bulkDelete(fetched)
      .then(() => {
        message.channel.send("Efetuada a limpeza do chat!");
      })
      .catch((erro) => {
        logHandler.log(erro);
      });
  } catch (error) {
    logHandler.log(error);
    message.channel.send("Erro ao tentar limpar chat!");
  }
};

const ping = async (message, serverQueue) => {
  message.channel.send(
    `🏓Latency is ${
      Date.now() - message.createdTimestamp
    }ms. API Latency is ${Math.round(client.ws.ping)}ms`
  );
};

const help = async (message, serverQueue) => {
  let help = "Comandos: \n";
  Comandos.forEach((comand) => {
    help += `${comand.nome}: ${comand.description} \n`;
  });
  message.channel.send(help);
};

const exit = async (message, serverQueue) => {
  if (message.author.id === "220610573853917186") {
    message.channel
      .send("O bot foi encerrado!")
      .then((data) => {
        return process.exit(22);
      })
      .catch();
  }
};

//Metodos Auxiliares
const getVideoInfo = async (message, serverQueue, url) => {
  ytdl.getInfo(url).then(
    (data) => {
      start(message, serverQueue, data);
    },
    (err) => {
      logHandler.log(err);
      return message.channel.send("Erro ao tentar buscar video");
    }
  );
};

const start = async (message, serverQueue, songInfo) => {
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return message.channel.send(
      "Você precisar está em um canal de voz para reproduzir musicas!"
    );
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(
      "I need the permissions to join and speak in your voice channel!"
    );
  }

  const song = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
  };

  if (!serverQueue) {
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true,
    };

    queue.set(message.guild.id, queueContruct);

    queueContruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueContruct.connection = connection;
      message.channel.send(`Reproduzindo: ${song.title}!`);
      logHandler.log(`Reproduzindo: ${song.title}!`);
      play(message.guild, queueContruct.songs[0]);
    } catch (err) {
      logHandler.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    return message.channel.send(`${song.title} foi adicionado a fila!`);
  }
};

const play = async (guild, song) => {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    desconectar(guild);
    return;
  } else {
    const dispatcher = serverQueue.connection
      .play(
        await ytdl(song.url, {
          filter: "audioonly",
          quality: "highestaudio",
          highWaterMark: 1 << 25,
        })
      )
      .on("finish", () => {
        proximaMusica(guild, serverQueue);
      })
      .on("end", () => {
        proximaMusica(guild, serverQueue);
      })
      .on("error", (error) => {
        logHandler.error(error);
        proximaMusica(guild, serverQueue);
      });
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  }
};

const proximaMusica = async (guild, serverQueue) => {
  logHandler.log("Musica encerrada!");
  serverQueue.songs.shift();
  play(guild, serverQueue.songs[0]);
};

const usuarioMudouDeCanal = (oMember, bFlEntrou) => {
  client.channels
    .fetch(oMember.channelID)
    .then((resolve) => {
      mensagem = `${oMember.member.displayName} ${
        bFlEntrou ? "Entrou" : "Saiu"
      } do canal de voz ${resolve.name}`;
      oMember.guild.channels.cache
        .filter(
          (channel) => channel.name === "chat" || channel.name === "geral"
        )
        .first()
        .send(mensagem);
    })
    .catch((error) => {
      logHandler.log(error);
    });
};

const Comandos = [
  {
    nome: "play",
    description: "Reproduz audio do video do youtube informado.",
    method: execute,
  },
  {
    nome: "skip",
    description: "Pula para o proximo audio",
    method: skip,
  },
  {
    nome: "stop",
    description: "Para a reproducão de todos os audios",
    method: stop,
  },
  {
    nome: "listar",
    description: "Lista as musicas na fila",
    method: listar,
  },
  {
    nome: "desconectar",
    description: "Desconecta o bot da sala",
    method: desconectar,
  },
  {
    nome: "clearchat",
    description: "Limpa o chat (somente para administradores)",
    method: clearchat,
  },
  {
    nome: "ping",
    description: "Retorna o tempo de resposta do bot",
    method: ping,
  },
  {
    nome: "help",
    description: "Lista todos os comando disponiveis",
    method: help,
  },
  {
    nome: "exit",
    description: "Encerra o bot (comente ocristopfer)",
    method: exit,
  },
];

const IniciarCliente = () => {
  if (config.token !== "") {
    client.login(config.token);
  } else {
    logHandler.log("Configure seu token no aquivo config.json");
    process.exit(0);
  }
};

if (config === null) {
  var fs = require("fs");
  var jsonConfig = {
    prefix: "!",
    token: "",
  };
  fs.writeFile("./src/config.json", JSON.stringify(jsonConfig), function (err) {
    if (err) {
      throw err;
    }
    config = require("./config.json");
    IniciarCliente();
  });
} else {
  IniciarCliente();
}

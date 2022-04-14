import "dotenv/config";
import { Client } from "discord.js";
import LogHandler from "./handlers/logHandler.js";
import MusicHandler from "./handlers/musicHandler.js";
import * as express from "express";
const client = new Client();
const queue = new Map();
const logHandler = new LogHandler();

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Well done!");
});

app.listen(port, () => {
  console.log("The application is listening on port 3000!");
});

var http = require("http");
setInterval(function () {
  http.get("https://bot-cda-cris.herokuapp.com/");
}, 300000); // every 5 minutes (300000)

//Discord events
client.once("ready", () => {
  logHandler.log("Iniciado");
});

client.on("guildMemberAdd", async (member) => {
  //member.guild.channels.get("channelID").send("Bem Vindo :D");
});

client.on("voiceStateUpdate", async (oldMember, newMember) => {
  if (oldMember.channelID !== newMember.channelID) {
    usuarioMudouDeCanal(oldMember, false);
    usuarioMudouDeCanal(newMember, true);
  }
});

client.on("message", async (message) => {
  let prefix = process.env.PREFIX;
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  logHandler.log(`Comando informado: ${message}`);
  let args = message.content.slice(prefix.length).trim().split(/ +/g);
  let comando = args.shift().toLocaleLowerCase();
  let serverQueue = queue.get(message.guild.id);

  try {
    Comandos.forEach((element) => {
      if (element.nome === comando) {
        element.method(message, serverQueue);
      }
    });
  } catch (error) {
    logHandler.log(comando + error);
  }
});

//Comandos
const execute = async (message, serverQueue) => {
  return new MusicHandler(queue, desconectar).play(message, serverQueue);
};

const skip = async (message, serverQueue) => {
  return new MusicHandler(queue, desconectar).skip(message, serverQueue);
};

const stop = async (message, serverQueue) => {
  return new MusicHandler(queue, desconectar).stop(message, serverQueue);
};

const listar = async (message, serverQueue) => {
  return new MusicHandler(queue, desconectar).listarMusicas(
    message,
    serverQueue
  );
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
const usuarioMudouDeCanal = (oMember, bFlEntrou) => {
  client.channels
    .fetch(oMember.channelID)
    .then((resolve) => {
      let mensagem = `${oMember.member.displayName} ${
        bFlEntrou ? "Entrou" : "Saiu"
      } do canal de voz ${resolve}`;
      oMember.guild.channels.cache
        .filter(
          (channel) => channel.name === "chat" || channel.name === "geral"
        )
        .first()
        .send(mensagem);
    })
    .catch((error) => {
      //problema na api relata erro toda hora mesmo com a rotina funcionando
      //logHandler.log(error);
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
  let token = process.env.TOKEN;
  if (token !== "") {
    client.login(token);
  } else {
    logHandler.log("Configure seu token no aquivo .env");
    process.exit(0);
  }
};

IniciarCliente();

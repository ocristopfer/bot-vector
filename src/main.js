const Discord = require('discord.js');
const config = require('./config.json');
const getContents = require('./getContents.js');
const client = new Discord.Client();
const queue = new Map();
const ytdl = require('ytdl-core');
const Comandos = [{
  nome: "play",
  description: "Reproduz audio do video do youtube informado.",
  method: execute

}, {
  nome: "skip",
  description: "Pula para o proximo audio",
  method: skip
}, {
  nome: "stop",
  description: "Para a reproducão de todos os audios",
  method: stop
}, {
  nome: "listar",
  description: "Lista as musicas na fila",
  method: listar
}, {
  nome: "desconectar",
  description: "Desconecta o bot da sala",
  method: desconectar
}, {
  nome: "clearchat",
  description: "Limpa o chat (somente para administradores)",
  method: clearchat
}, {
  nome: "ping",
  description: "Retorna o tempo de resposta do bot",
  method: ping
}, {
  nome: "help",
  description: "Lista todos os comando disponiveis",
  method: help
}, {
  nome: "exit",
  description: "Encerra o bot (comente ocristopfer)",
  method: exit
}]

//Discord events
client.once('ready', () => {
  console.log('Iniciado!');
});

client.once('reconnecting', () => {
  console.log('Reconectando!');
});

client.once('disconnect', () => {
  console.log('Desconectado!');
});

client.on('guildMembersChunk', async member => {
  console.log('disponivel')
})

client.on('guildMemberAvailable', async member => {
  console.log('disponivel')
})

client.on('guildMemberAdd', async member => {
  member.guild.channels.get('channelID').send("Welcome");
});

client.on('voiceStateUpdate', async (oldMember, newMember) => {
  let oldUserChannel = newMember.guild.channels.cache.get(oldMember.channelID)
  let newUserChannel = newMember.guild.channels.cache.get(newMember.channelID);
  let mensagem = "";

  if (oldUserChannel !== undefined) {
    mensagem = oldMember.member.displayName + ' Saiu do canal de voz'
    client.channels.cache.filter((channel) => channel.name === 'chat' || channel.name === 'geral').first().send(mensagem);
  }

  if (newUserChannel !== undefined) {
    mensagem = newMember.member.displayName + ' Entrou no canal de voz';
    client.channels.cache.filter((channel) => channel.name === 'chat' || channel.name === 'geral').first().send(mensagem);
  }

})

client.on('message', async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;

  let args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  let comando = args.shift().toLocaleLowerCase();
  const serverQueue = queue.get(message.guild.id);

  try {
    Comandos.forEach(element => {
      if (element.nome === comando) {
        element.method(message, serverQueue)
      }
    });
  } catch (error) {
    console.log(comando, error)
  }

});

//Comandos
async function execute(message, serverQueue) {
  valorInformado = message.content.split(' ').splice(1).join(' ');

  if (valorInformado === "") {
    return message.channel.send('Informe o nome ou a url do video a ser reproduzido!');
  }

  if (valorInformado.substring(0, 4) !== 'http') {
    valorInformado = await getContents.buscarYouTubeNoApi(valorInformado);
  }
  return getVideoInfo(message, serverQueue, valorInformado)
}

async function skip(message, serverQueue) {
  if (!message.member.voice.channel) return message.channel.send('Você precisar está em um canal de voz para reproduzir musicas!');
  if (!serverQueue) return message.channel.send('Não há musica para ser pulada!');
  serverQueue.connection.dispatcher.destroy();
  proximaMusica(message.guild, serverQueue);
}

async function stop(message, serverQueue) {
  if (!message.member.voice.channel) return message.channel.send('Você precisar está em um canal de voz para reproduzir musicas!');
  if (!serverQueue) return message.channel.send('Não há musica para ser pausada!');
  serverQueue.songs = [];
  try {
    serverQueue.connection.dispatcher.destroy();
    desconectar(message);
  } catch (error) {

  }

}

async function listar(message, serverQueue) {
  if (serverQueue) {
    if (serverQueue.songs.length > 0) {
      listaMusicas = " \n ";
      contador = 1;
      serverQueue.songs.forEach(element => {
        listaMusicas += contador + " : " + element.title + ' \n ';
        contador += 1;
      });
      return message.channel.send(`${listaMusicas}`);
    } else {
      return message.channel.send("Nenhuma música na fila");
    }
  }
}

async function desconectar(message) {
  let guild = message.guild != undefined ? message.guild : message;
  const serverQueue = queue.get(guild.id);
  if (serverQueue != undefined) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
  }
  return;
}


async function clearchat(message) {
  if (!message.member.hasPermission('ADMINISTRATOR')) {
    return;
  }

  try {
    message.delete();
    const fetched = await message.channel.fetchMessages({
      limit: 99
    });
    message.channel.bulkDelete(fetched).then(() => {
      message.channel.send('Efetuada a limpeza do chat!');
    }).catch(erro => {
      console.log(erro)
    });
  } catch (error) {
    message.channel.send('Erro ao tentar limpar chat!')
  }

}

async function ping(message) {
  message.channel.send(`🏓Latency is ${Date.now() - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
}

function help(message) {
  let help = "Comandos: \n";
  Comandos.forEach(comand => {
    help += `${comand.nome}: ${comand.description} \n`
  });
  message.channel.send(help);
}

async function exit(message) {
  if (message.author.id === "220610573853917186") {
    message.channel.send('O bot foi encerrado!').then((data) => {
      return process.exit(22);
    }).catch();
  }

}

//Metodos Auxiliares
async function getVideoInfo(message, serverQueue, url) {
  ytdl.getInfo(url).then((data) => {
    start(message, serverQueue, data)
  }, (err) => {
    console.log(err);
    return message.channel.send('Erro ao tentar buscar video');
  });
}

async function start(message, serverQueue, songInfo) {
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) return message.channel.send('Você precisar está em um canal de voz para reproduzir musicas!');
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
    return message.channel.send('I need the permissions to join and speak in your voice channel!');
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
      message.channel.send(`Reproduzindo: ${song.title}!`)
      console.log(`Reproduzindo: ${song.title}!`)
      play(message.guild, queueContruct.songs[0]);
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    return message.channel.send(`${song.title} foi adicionado a fila!`);
  }
}

async function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    desconectar(guild);
    return;
  } else {
    const dispatcher = serverQueue.connection.play(await ytdl(song.url, {
        filter: 'audioonly',
        quality: 'highestaudio',
        highWaterMark: 1 << 25
      }))
      .on('finish', () => {
        proximaMusica(guild, serverQueue);
      }).on('end', () => {
        proximaMusica(guild, serverQueue);
      })
      .on('error', error => {
        console.error(error);
        proximaMusica(guild, serverQueue);
      });
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  }
}

async function proximaMusica(guild, serverQueue) {
  console.log('Musica encerrada!');
  serverQueue.songs.shift();
  play(guild, serverQueue.songs[0]);
}


client.login(config.token);
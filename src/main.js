require('http').createServer().listen(3000);
const Discord = require('discord.js');
const config = require('./config.json');
const getContents = require('./getContents.js');
const client = new Discord.Client();
const queue = new Map();
const ytdl = require('ytdl-core');
//const ytdl = require('ytdl-core-discord');
const { futimesSync } = require('fs');
const { count } = require('console');


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
	console.log('ué')
	member.guild.channels.get('channelID').send("Welcome");
});

client.on('voiceStateUpdate', async (oldMember, newMember) => {
	let oldUserChannel = newMember.guild.channels.cache.get(oldMember.channelID)
	let newUserChannel = newMember.guild.channels.cache.get(newMember.channelID);
	let mensagem = "";

	if (oldUserChannel === undefined && newUserChannel !== undefined) {
		mensagem = newMember.member.displayName + ' Entrou no canal de voz';
	} else if (newUserChannel === undefined) {
		mensagem = oldMember.member.displayName + ' Saiu do canal de voz'
	}
	client.channels.cache.filter((channel) => channel.name === 'chat').first().send(mensagem);
})

client.on('message', async message => {

	if (message.author.bot) return;
	if (!message.content.startsWith(config.prefix)) return;

	let args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	let comando = args.shift().toLocaleLowerCase();
	const serverQueue = queue.get(message.guild.id);

	if (comando === 'play') {
		execute(message, serverQueue);
		return;
	} else if (comando === 'skip') {
		skip(message, serverQueue);
		return;
	} else if (comando === 'stop') {
		stop(message, serverQueue);
		return;
	} else if (comando === 'desconectar') {
		desconectar(message.guild);
		return;
	} else if (comando === 'listar') {
		listarMusicas(message, serverQueue);
		return;
	} else if (comando === 'clearchat' & message.member.hasPermission('ADMINISTRATOR')) {
		limparChat(message);
	} else if (comando === 'help') {
		help(message);
	} else if (comando === 'exit' & message.member.hasPermission('ADMINISTRATOR')) {
		message.channel.send('O bot foi encerrado!').then((data) => {
			return process.exit(22);
		})
	}
	else {
		message.channel.send('É necessário informar um comando válido! \n Digite .help para mais informações.')
	}
});


function help(message) {
	message.channel.send('Comandos: \n ' +
		'.play : reproduz audio de video do youtube \n' +
		'.skip : pula para o proximo audio \n' +
		'.stop : para a reproducão de todos os audios \n' +
		'.listar : lista as musicas na fila \n' +
		'.desconectar : desconecta o bot da sala \n' +
		'.clearchat : Limpa o chat (somente para administradores) \n'
	)
}

async function limparChat(message) {
	try {
		message.delete();
		const fetched = await message.channel.fetchMessages({ limit: 99 });
		message.channel.bulkDelete(fetched).then(() => {
			message.channel.send('Efetuada a limpeza do chat!');
		});
	} catch (error) {
		message.channel.send('Erro ao tentar limpar chat!')
	}

}

async function execute(message, serverQueue) {
	var args = [];
	args[0] = message.content.split(' ')[0];
	args[1] = message.content.split(' ').splice(1).join(' ');

	console.log(args);
	var url = "";
	if (args[1] === "") {
		return message.channel.send('Informe o nome ou a url do video a ser reproduzido!');
	} else if (args[1].substring(0, 4) === 'http') {
		url = args[1];
		getVideoInfo(message, serverQueue, url)
		//start(message, serverQueue, getVideoInfo(message, url));
	} else {
		var argumentos = args[1]
		getContents.buscarYouTubeNoApi(argumentos.replace(' ', '+')).then((data) => {
			console.log(data)
			getVideoInfo(message, serverQueue, data)
			//start(message, serverQueue, getVideoInfo(data))
		})
		//buscarYoutube(args,message, serverQueue, url)	
	}

}

async function getVideoInfo(message, serverQueue, url) {
	ytdl.getInfo(url).then((data) => {
		console.log('iniciar')
		start(message, serverQueue, data)
	}, (err) => {
		console.log(err);
		return message.channel.send('Erro ao tentar buscar video');
	});
}

//Antiga busca usando api, não mais utilizado.
var errosYoutube = 0;
async function buscarYoutube(args, message, serverQueue, url) {
	YouTubeApi.searchAll(args[1], 1).then((data) => {
		console.log(data.items);
		if (data.items[0].id['kind'] === "youtube#video") {
			url = "https://www.youtube.com/watch?v=" + data.items[0].id['videoId'];
			getVideoInfo(message, serverQueue, url).then(() => {
				errosYoutube = 0;
			})
		} else {
			return message.channel.send('Erro ao tentar buscar video');
		}

	}, (err) => {
		if (errosYoutube > 3) {
			return message.channel.send('Erro ao tentar buscar video');
		} else {
			console.log("youtube")
			YouTubeApi = new YoutubeDataAPI(config.youtubetoken2);
			errosYoutube = errosYoutube + 1;
			buscarYoutube(args, message, serverQueue, url)
		}
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
		console.log(serverQueue.songs);
		return message.channel.send(`${song.title} foi adicionado a fila!`);
	}
}

async function skip(message, serverQueue) {
	if (!message.member.voice.channel) return message.channel.send('Você precisar está em um canal de voz para reproduzir musicas!');
	if (!serverQueue) return message.channel.send('Não há musica para ser pulada!');
	serverQueue.connection.dispatcher.destroy();
	proximaMusica(message.guild, serverQueue);
	/*
	try {
		
		serverQueue.songs.shift();
		play(guild, serverQueue.songs[0]);

	

		if (serverQueue) {
			if (serverQueue.song && serverQueue.song.length == 0) {
				desconectar(message.guild);
			}
		}
	} catch (error) {

	}*/


}

async function stop(message, serverQueue) {
	if (!message.member.voice.channel) return message.channel.send('Você precisar está em um canal de voz para reproduzir musicas!');
	if (!serverQueue) return message.channel.send('Não há musica para ser pausada!');
	serverQueue.songs = [];
	try {
		serverQueue.connection.dispatcher.destroy();
		desconectar(message.guild);
	} catch (error) {

	}

}

async function desconectar(guild) {
	const serverQueue = queue.get(guild.id);
	if (serverQueue != undefined) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
	}
	return;
}


async function listarMusicas(message, serverQueue) {
	if (serverQueue) {
		console.log(serverQueue.songs)
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

async function play(guild, song) {
	const serverQueue = queue.get(guild.id);
	if (!song) {
		desconectar(guild);
		return;
	} else {

		//const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		//const dispatcher = serverQueue.connection.playOpusStream(await ytdl(song.url))
		const dispatcher = serverQueue.connection.play(await ytdl(song.url, { filter: 'audioonly', quality: 'highestaudio',
		highWaterMark: 1 << 25 }))
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

tentativas = 0;
function iniciarBot() {
	try {
		if (tentativas < 3) {
			tentativas = 0;
			client.login(config.token);
		}
	} catch (error) {
		tentativas += 1;
		iniciarBot()
	}
}

iniciarBot();
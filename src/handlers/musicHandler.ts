import YoutubeHandler from "./youtubeHandler.js";
import * as ytdl from "ytdl-core";
import LogHandler from "./logHandler.js";
export default class MusicHandler {
  queue: any;
  ytdl: any;
  youtubeHandler: YoutubeHandler;
  logHandler: LogHandler;
  desconectar: any;
  constructor(queue, desconectar) {
    this.queue = queue;
    this.ytdl = ytdl;
    this.youtubeHandler = new YoutubeHandler();
    this.logHandler = new LogHandler();
    this.desconectar = desconectar;
  }

  /**
   *
   * @param {*} message
   * @param {*} serverQueue
   * @returns
   */
  play = async (message, serverQueue) => {
    let valorInformado = message.content.split(" ").splice(1).join(" ");

    if (valorInformado === "") {
      return message.channel.send(
        "Informe o nome ou a url do video a ser reproduzido!"
      );
    }

    if (valorInformado.substring(0, 4) !== "http") {
      valorInformado = await this.youtubeHandler.buscarYouTubeNoApi(
        valorInformado
      );
    }
    return this.getVideoInfo(message, serverQueue, valorInformado);
  };

  /**
   *
   * @param {*} message
   * @param {*} serverQueue
   * @returns
   */
  skip = async (message, serverQueue) => {
    if (!message.member.voice.channel)
      return message.channel.send(
        "Você precisar está em um canal de voz para reproduzir musicas!"
      );
    if (!serverQueue)
      return message.channel.send("Não há musica para ser pulada!");
    serverQueue.connection.dispatcher.destroy();
    this.proximaMusica(message.guild, serverQueue);
  };

  /**
   *
   * @param {*} message
   * @param {*} serverQueue
   * @returns
   */
  stop = async (message, serverQueue) => {
    if (!message.member.voice.channel)
      return message.channel.send(
        "Você precisar está em um canal de voz para reproduzir musicas!"
      );
    if (!serverQueue)
      return message.channel.send("Não há musica para ser pausada!");
    serverQueue.songs = [];
    try {
      serverQueue.connection.dispatcher.destroy();
      this.desconectar(message);
    } catch (error) {
      this.logHandler.log(error);
    }
  };

  /**
   *
   * @param {*} message
   * @param {*} serverQueue
   * @returns
   */
  listarMusicas = async (message, serverQueue) => {
    if (serverQueue) {
      if (serverQueue.songs.length > 0) {
        let listaMusicas = " \n ";
        let contador = 1;
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

  /**
   *
   * @param {*} message
   * @param {*} serverQueue
   * @param {*} url
   */
  getVideoInfo = async (message, serverQueue, url) => {
    this.ytdl.getInfo(url).then(
      (songInfo) => {
        this.prepararMusica(message, serverQueue, songInfo);
      },
      (err) => {
        this.logHandler.log(err);
        return message.channel.send("Erro ao tentar buscar video");
      }
    );
  };

  /**
   *
   * @param {*} message
   * @param {*} serverQueue
   * @param {*} songInfo
   * @returns
   */
  prepararMusica = async (message, serverQueue, songInfo) => {
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

      this.queue.set(message.guild.id, queueContruct);

      queueContruct.songs.push(song);

      try {
        var connection = await voiceChannel.join();
        queueContruct.connection = connection;
        message.channel.send(`Reproduzindo: ${song.title}!`);
        this.logHandler.log(`Reproduzindo: ${song.title}!`);
        this.tocarMusica(message.guild, queueContruct.songs[0]);
      } catch (err) {
        this.logHandler.log(err);
        this.queue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } else {
      serverQueue.songs.push(song);
      this.logHandler.log(`${song.title} foi adicionado a fila!`);
      return message.channel.send(`${song.title} foi adicionado a fila!`);
    }
  };

  /**
   *
   * @param {*} guild
   * @param {*} song
   * @returns
   */
  tocarMusica = async (guild, song) => {
    const serverQueue = this.queue.get(guild.id);
    if (!song) {
      this.desconectar(guild);
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
          this.logHandler.log(`Musica ${song.title} encerrada!`);
          this.proximaMusica(guild, serverQueue);
        })
        .on("end", () => {
          this.logHandler.log(`Musica ${song.title} encerrada!`);
          this.proximaMusica(guild, serverQueue);
        })
        .on("error", (error) => {
          this.logHandler.log(error);
          this.proximaMusica(guild, serverQueue);
        });
      dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    }
  };

  /**
   *
   * @param {*} guild
   * @param {*} serverQueue
   */
  proximaMusica = async (guild, serverQueue) => {
    serverQueue.songs.shift();
    this.tocarMusica(guild, serverQueue.songs[0]);
  };
}

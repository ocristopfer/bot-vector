import 'dotenv/config'
import { Client, Message } from 'discord.js'
import LogHandler from './logHandler'
import MusicHandler from './musicHandler.js'
import { inject, injectable } from 'inversify'
import { TYPES } from '../types'
import BotDesconect from '../services/botDesconect'
@injectable()
export default class BotHandler {
  private botClient: Client
  private logHandler: LogHandler
  private musicHandler: MusicHandler
  private queue: Map<any, any>
  private comandos: any
  private botDesconect: BotDesconect
  constructor(
    @inject(TYPES.Client) botClient: Client,
    @inject(TYPES.SongQueue) SongQueue: Map<any, any>,
    @inject(TYPES.MusicHandler) musicHandler: MusicHandler,
    @inject(TYPES.BotDesconect) botDesconect: BotDesconect,
  ) {
    this.botClient = botClient
    this.logHandler = new LogHandler()
    this.musicHandler = musicHandler
    this.queue = SongQueue
    this.comandos = []
    this.botDesconect = botDesconect
  }
  public init = () => {
    this.eventsBot()
    this.prepararComandos()
    this.startBot()
  }

  private startBot = () => {
    const token = process.env.TOKEN || ''
    if (token !== '') {
      this.botClient.login(token)
    } else {
      this.logHandler.log('Configure seu token no aquivo .env')
      process.exit(0)
    }
  }

  private eventsBot = () => {
    this.botClient.once('ready', () => {
      this.logHandler.log('Iniciado')
    })
    this.botClient.on('guildMemberAdd', async (member: any) => {
      member.guild.channels.get('channelID').send('Bem Vindo :D')
    })

    this.botClient.on('voiceStateUpdate', async (oldMember, newMember) => {
      if (oldMember.channelID !== newMember.channelID) {
        this.usuarioMudouDeCanal(oldMember, false)
        this.usuarioMudouDeCanal(newMember, true)
      }
    })

    this.botClient.on('message', async (message) => {
      const prefix = process.env.PREFIX || '!'
      if (message.author.bot) return
      if (!message.content.startsWith(prefix)) return
      this.logHandler.log(`Comando informado: ${message}`)
      const args = message.content.slice(prefix.length).trim().split(/ +/g)
      const comando = args.shift()?.toLocaleLowerCase()
      const serverQueue = this.queue.get(message.guild?.id)

      try {
        this.comandos.forEach((element) => {
          if (element.nome === comando) {
            element.method(message, serverQueue)
          }
        })
      } catch (error: any) {
        this.logHandler.log(comando + error.toString())
      }
    })
  }

  //Comandos
  private execute = async (message: Message, serverQueue: any) => {
    return this.musicHandler.play(message, serverQueue)
  }

  private skip = async (message: Message, serverQueue: any) => {
    return this.musicHandler.skip(message, serverQueue)
  }

  private stop = async (message: Message, serverQueue: any) => {
    return this.musicHandler.stop(message, serverQueue)
  }

  private listar = async (message: Message, serverQueue: any) => {
    return this.musicHandler.listarMusicas(message, serverQueue)
  }

  public desconectar = async (message: Message, serverQueue: any) => {
    return this.botDesconect.desconectar(message)
  }

  private clearchat = async (message: any) => {
    if (!message.member.hasPermission('ADMINISTRATOR')) {
      return
    }

    try {
      message.delete()
      const fetched = await message.channel.fetchMessages({
        limit: 99,
      })
      message.channel
        .bulkDelete(fetched)
        .then(() => {
          message.reply('Efetuada a limpeza do chat!')
        })
        .catch((erro: any) => {
          this.logHandler.log(erro)
        })
    } catch (error) {
      this.logHandler.log(error)
      message.reply('Erro ao tentar limpar chat!')
    }
  }

  private ping = async (message: Message) => {
    message.reply(
      `🏓Latency is ${
        Date.now() - message.createdTimestamp
      }ms. API Latency is ${Math.round(this.botClient.ws.ping)}ms`,
    )
  }

  private help = async (message: Message) => {
    let help = 'Comandos: \n'
    this.comandos.forEach((comand: any) => {
      help += `${comand.nome}: ${comand.description} \n`
    })
    message.reply(help)
  }

  private exit = async (message: Message) => {
    if (message.author.id === '220610573853917186') {
      message
        .reply('O bot foi encerrado!')
        .then(() => {
          return process.exit(22)
        })
        .catch()
    }
  }

  private usuarioMudouDeCanal = (oMember: any, bFlEntrou: boolean) => {
    if (oMember.id === '610170869339390035') return
    this.botClient.channels
      .fetch(oMember.channelID)
      .then((resolve) => {
        const mensagem = `${oMember.member} ${
          bFlEntrou ? 'Entrou' : 'Saiu'
        } do canal de voz ${resolve}`
        oMember.guild.channels.cache
          .filter(
            (channel: any) =>
              channel.name === 'chat' || channel.name === 'geral',
          )
          .first()
          .send(mensagem)
      })
      .catch(() => {
        //problema na api relata erro toda hora mesmo com a rotina funcionando
        //logHandler.log(error);
      })
  }

  private prepararComandos = () => {
    this.comandos = [
      {
        nome: 'play',
        description: 'Reproduz audio do video do youtube informado.',
        method: this.execute,
      },
      {
        nome: 'skip',
        description: 'Pula para o proximo audio',
        method: this.skip,
      },
      {
        nome: 'stop',
        description: 'Para a reproducão de todos os audios',
        method: this.stop,
      },
      {
        nome: 'listar',
        description: 'Lista as musicas na fila',
        method: this.listar,
      },
      {
        nome: 'desconectar',
        description: 'Desconecta o bot da sala',
        method: this.desconectar,
      },
      {
        nome: 'clearchat',
        description: 'Limpa o chat (somente para administradores)',
        method: this.clearchat,
      },
      {
        nome: 'ping',
        description: 'Retorna o tempo de resposta do bot',
        method: this.ping,
      },
      {
        nome: 'help',
        description: 'Lista todos os comando disponiveis',
        method: this.help,
      },
      {
        nome: 'exit',
        description: 'Encerra o bot (comente ocristopfer)',
        method: this.exit,
      },
    ]
  }
}

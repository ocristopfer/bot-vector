import { Message } from 'discord.js'
import { inject, injectable } from 'inversify'
import { LogHandler } from '../../handlers'
import { TYPES } from '../../types'
import { BotComands } from '../interfaces'

@injectable()
export default class BotComandHelp implements BotComands {
  private logHandler: LogHandler
  private prefix: string
  constructor(
    @inject(TYPES.LogHandler) logHandler: LogHandler,
    @inject(TYPES.Prefix) prefix: string,
  ) {
    this.logHandler = logHandler
    this.prefix = prefix
  }
  private comandos = [
    {
      nome: 'play',
      description:
        'Reproduz áudio do vídeo do YouTube informado (adicione lista separada por virgula). ',
    },
    {
      nome: 'playlist',
      description:
        'Reproduz playlist de video do YouTube (basta informar a url ou o Id da playlist) ',
    },
    {
      nome: 'pause',
      description: 'Pausa o áudio ',
    },
    {
      nome: 'resume',
      description: 'Retoma a reprodução do áudio ',
    },
    {
      nome: 'skip',
      description: 'Pula para o próximo áudio ',
    },
    {
      nome: 'stop',
      description: 'Para a reprodução de todos os áudios',
    },
    {
      nome: 'listar',
      description: 'Lista as músicas na fila',
    },
    {
      nome: 'desconectar',
      description: 'Desconecta o Bot da sala',
    },
    {
      nome: 'clearchat',
      description: 'Limpa o chat (somente para administradores) (desabilitado)',
    },
    {
      nome: 'ping',
      description: 'Retorna o tempo de resposta do Bot ',
    },
    {
      nome: 'help',
      description: 'Lista todos os comandos disponíveis ',
    },
    {
      nome: 'exit',
      description: 'Encerra o Bot (somente @ocristopfer)',
    },
  ]

  public execute = async (message: Message) => {
    try {
      let help = 'Comandos: \n'
      this.comandos.forEach((comand) => {
        help += `${this.prefix}${comand.nome}: ${comand.description} \n`
      })
      message.reply(help)
    } catch (error) {
      return this.logHandler.errorLog(error, message)
    }
  }
}

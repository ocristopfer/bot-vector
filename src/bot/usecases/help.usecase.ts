import { Client, Message } from 'discord.js'
import { inject, injectable } from 'inversify'
import { TYPES } from '../../types'

@injectable()
export default class BotComandHelp implements BotComands {
  private comandos = [
    {
      nome: 'play',
      description: 'Reproduz audio do video do youtube informado.',
    },
    {
      nome: 'skip',
      description: 'Pula para o proximo audio',
    },
    {
      nome: 'stop',
      description: 'Para a reproducão de todos os audios',
    },
    {
      nome: 'listar',
      description: 'Lista as musicas na fila',
    },
    {
      nome: 'desconectar',
      description: 'Desconecta o bot da sala',
    },
    {
      nome: 'clearchat',
      description: 'Limpa o chat (somente para administradores)',
    },
    {
      nome: 'ping',
      description: 'Retorna o tempo de resposta do bot',
    },
    {
      nome: 'help',
      description: 'Lista todos os comando disponiveis',
    },
    {
      nome: 'exit',
      description: 'Encerra o bot (comente ocristopfer)',
    },
  ]

  public execute = async (message: Message) => {
    let help = 'Comandos: \n'
    this.comandos.forEach((comand: any) => {
      help += `${comand.nome}: ${comand.description} \n`
    })
    message.reply(help)
  }
}

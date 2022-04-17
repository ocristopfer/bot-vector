import { Message } from 'discord.js'

export interface BotComands {
  execute(message: Message): void
}

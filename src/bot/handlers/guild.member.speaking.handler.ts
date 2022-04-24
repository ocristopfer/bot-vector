import { injectable } from 'inversify'

@injectable()
export default class GuildMemberSpeakingHandler {
  public handler = async (member, speaking) => {
    //TODO implemente speeach converter
  }
}

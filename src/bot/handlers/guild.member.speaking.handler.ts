import { injectable } from 'inversify'

@injectable()
export default class GuildMemberSpeakingHandler {
  public handler = (member, speaking) => {
    console.log(member, speaking)
  }
}

export default class ValidHttpURL {
  public static IsUrl = (url: string) => {
    try {
      new URL(url)
    } catch (error) {
      return false
    }
    return true
  }
}

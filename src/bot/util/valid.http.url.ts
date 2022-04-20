export default class ValidHttpURL {
  public static IsUrl = (url) => {
    try {
      new URL(url)
    } catch (error) {
      return false
    }
    return true
  }
}

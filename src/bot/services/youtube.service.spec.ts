import { TYPES } from '../../../src/types'
import container from '../../inversify.config'
import YouTubeService from './youtube.service'

describe('test', () => {
  let youTubeService: YouTubeService

  beforeEach(() => {
    youTubeService = container.get<YouTubeService>(TYPES.YouTubeService)
  })

  describe('Teste se retorna a url do youtube', () => {
    it('Url do video Ela partiu', async () => {
      expect(await youTubeService.buscarYouTubeNoApi('ela partiu')).toBe(
        'https://www.youtube.com/watch?v=syqJAgTQdlU',
      )
    })
  })
})

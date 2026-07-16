import type { FastifyInstance } from 'fastify'
import { ScrobblesAPI } from '../ext/scrobbles/index.js'
import type { LastFMTrackReturnObject } from '../ext/scrobbles/types.js'

const api = new ScrobblesAPI(
  process.env.LASTFM_TOKEN!,
  process.env.LASTFM_USERNAME!,
)

async function scrobblesRoutes(fastify: FastifyInstance, options: any) {
  // GET /scrobbles/nowplaying
  fastify.get('/api/scrobbles/nowplaying', async (request, reply) => {
    const data = await api.getRecentScrobbles(1, 1)

    if ('error' in data) {
      return { ok: false, error: data.error }
    }

    const nowPlaying = data.recenttracks.track[0]

    if (!nowPlaying) {
      return { ok: true, track: null, error: 'No track currently playing' }
    }

   const _artist = await api.getArtistInfo(nowPlaying.artist['#text'])
    const artist = !_artist.error
      ? _artist.artist
      : {
          name: nowPlaying.artist['#text'],
          url: '',
          image: [{ size: 'large', '#text': '' }],
        }

    const largeImage = nowPlaying.image.find((img) => img.size === 'large')!
    const artistImage = artist.image.find((img) => img.size === 'large')!

    const track: LastFMTrackReturnObject = {
      name: nowPlaying.name,
      artist: {
        name: artist.name,
        image: artistImage['#text'],
        url: artist.url,
      },
      album: nowPlaying.album['#text'],
      url: nowPlaying.url,
      image: largeImage['#text'],
      date: nowPlaying.date?.uts!,
      nowplaying: nowPlaying['@attr']?.nowplaying === "true",
    }

    return {
      ok: true,
      attributes: {
        page: Number(data.recenttracks['@attr'].page),
        perPage: Number(data.recenttracks['@attr'].perPage),
        total: Number(data.recenttracks['@attr'].total),
        totalPages: Number(data.recenttracks['@attr'].totalPages),
        user: data.recenttracks['@attr'].user,
      },
      track,
    }
  })

  // GET /scrobbles/recents?limit=10&page=1
  fastify.get<{ Querystring: { limit?: string; page?: string } }>(
    '/api/scrobbles/recents',
    async (request, reply) => {
      const limit = Number(request.query.limit) || 10
      const page = Number(request.query.page) || 1

      const data = await api.getRecentScrobbles(page, limit)

      if ('error' in data) {
        return { ok: false, error: data.error }
      }

      const tracks = await Promise.all(
        data.recenttracks.track.map(async (track) => {
          const _artist = await api.getArtistInfo(track.artist['#text'])
          const artist = _artist?.artist

          const artistImage = artist
            ? artist.image.find((img) => img.size === 'large')!
            : { '#text': null }

          return {
            name: track.name,
            artist: {
              name: artist?.name,
              image: artistImage['#text'],
              url: artist?.url,
            },
            album: track.album['#text'],
            url: track.url,
            image: track.image.find((img) => img.size === 'large')?.['#text'] ?? null,
            listenedAt: track.date?.uts,
            nowplaying: !!track['@attr']?.nowplaying,
          }
        })
      )

      return {
        ok: true,
        attributes: {
          page: Number(data.recenttracks['@attr'].page),
          perPage: Number(data.recenttracks['@attr'].perPage),
          total: Number(data.recenttracks['@attr'].total),
          totalPages: Number(data.recenttracks['@attr'].totalPages),
          user: data.recenttracks['@attr'].user,
        },
        tracks,
      }
    }
  )
}

export default scrobblesRoutes

import type { LastFMArtistObject, LastFMRecentTracksResponse } from "./types.js"

export class ScrobblesAPI {
	token: string
	username: string
	apiUrl: string
  private artistCache: Record<string, LastFMArtistObject> = {};

	constructor(token: string, username: string) {
		this.token = token
		this.username = username
    this.apiUrl = `https://ws.audioscrobbler.com/2.0/?api_key=${this.token}&user=${this.username}&format=json&method=`
	}

  async getRecentScrobbles(page?: string|number, limit?: string|number) {
    let queryPage = page || 1;
    let queryLimit = limit || 5;
    const requestUrl = `${this.apiUrl}user.getRecentTracks&page=${queryPage}&limit=${queryLimit}`
    const responseRaw = await fetch(requestUrl, {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0"
      }
    })
    const response = await responseRaw.json() as LastFMRecentTracksResponse
    console.log(response.recenttracks)
    return {
      recenttracks: {
        "@attr": response.recenttracks["@attr"],
        track: response.recenttracks.track.slice(0, Number(queryLimit))
      }
    }
  }

  async getArtistInfo(artist: string) {
    // http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=Cher&api_key=YOUR_API_KEY&format=json
      const artistKey = encodeURIComponent(artist.toLowerCase().trim());
      console.log(artistKey)
      if (this.artistCache[artistKey]) {
        console.log("Returned from cache", artist)
        return this.artistCache[artistKey];
      }

      console.log("Cache wasnt found", artist)
      console.log(this.artistCache)

      const requestUrl = `${this.apiUrl}artist.getinfo&artist=${artist}`
      const responseRaw = await fetch(requestUrl, {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0"
        }
      })

      const text = await responseRaw.text()
      const response = JSON.parse(text) as LastFMArtistObject

      this.artistCache[artistKey] = response;
      return response
  }
}

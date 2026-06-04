export interface LastFMArtistObject {
  error?: number
  artist: {
    name: string;
    mbid: string;
    url: string;
    image: {
      "#text": string;
      size: string
    }[];
    streamable: string;
    ontour: string;
    stats: {
      listeners: string;
      playcount: string;
      userplaycount: string;
    };
    similiar: {
      artist: {
        name: string;
        url: string;
        image: {"#text": string; size: string}[]
      }[]
    };
    tags: {
      tag: {name: string; url: string}[]
    };
    bio: {
      links: {
        link: {
          "#text": string;
          rel: string;
          href: string
        };
        published: string,
        summary: string;
        content: string
      }
    }
  }
}

export interface LastFMRecentTracksResponse {
  recenttracks: {
      track: LastFMTrackObject[],

      '@attr': {
          user: string,
          page: string,
          perPage: string,
          totalPages: string,
          total: string
      }
  }
}

export interface LastFMTrackObject {
  name: string,
  streamable: string,
  mbid: string,
  url: string,
  album: { '#text': string, mbid: string },
  artist: { '#text': string, mbid: string },
  image: { '#text': string, size: string }[],
  date?: { uts: string, '#text': string },
  '@attr'?: { nowplaying: string }
}

export interface LastFMTrackReturnObject {
  name: string,
  url: string,
  album: string,
  artist: {
    name: string,
    image: string,
    url: string
  }
  image: string,
  date?: string,
  nowplaying: boolean
}

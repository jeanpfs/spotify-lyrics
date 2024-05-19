export interface LyricRecord {
  name: string;
  artists: string;
  platform: string;
  user: string;
  neteaseID?: number;
  lyric?: string;
  reviewed?: boolean;
  createdTime?: number;
  updatedTime?: number;
}

export interface LyricsResponse<T> {
  data?: T;
  message: string;
}

export interface Config {
  'spotify-lyrics'?: {
    'manager-ids'?: string;
  };
}

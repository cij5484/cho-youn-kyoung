export type AlbumTrackCredit = {
  role: string;
  name: string;
};

export type AlbumTrack = {
  number: number;
  title: string;
  subtitle?: string;
  duration?: string;
  credits?: AlbumTrackCredit[];
};

export type AlbumParticipant = {
  id?: string;
  name: string;
  role: string;
  image?: string;
  description?: string;
};

export type AlbumCredit = {
  role: string;
  names: string[];
  section?: string;
};

export type AlbumBookletImage = {
  src: string;
  alt: string;
  label?: string;
};

export type AlbumBooklet = {
  previewImages: AlbumBookletImage[];
  downloadUrl?: string;
  downloadLabel?: string;
};

export type AlbumStreamingLink = {
  platform: string;
  url: string;
  label?: string;
};

export type AlbumMediaItem = {
  type: 'video' | 'image' | 'article';
  title: string;
  url?: string;
  thumbnail?: string;
  description?: string;
};

export type AlbumDownload = {
  label: string;
  url: string;
  format?: string;
};

export type Album = {
  id: string;
  title: string;
  year: string;
  description: string;
  coverImage?: string;
  detailsPath?: string;
  featured?: boolean;
  tracks?: AlbumTrack[];
  participants?: AlbumParticipant[];
  credits?: AlbumCredit[];
  booklet?: AlbumBooklet;
  streamingLinks?: AlbumStreamingLink[];
  media?: AlbumMediaItem[];
  downloads?: AlbumDownload[];
};

export const albums: Album[] = [
  {
    id: 'han-beom-su-haegeum-sanjo-2020',
    title: '조윤경 해금산조－한범수류',
    year: '2020',
    description: '한범수류 해금산조의 결을 담은 조윤경의 산조 음반.',
    featured: true,
  },
];

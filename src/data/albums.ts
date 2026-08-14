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
  webAudioUrl?: string;
};

export type AlbumReleaseStatus = 'coming-soon' | 'released';

export type AlbumHeroTextures = {
  front?: string;
  back?: string;
  spineLeft?: string;
  spineRight?: string;
  top?: string;
  bottom?: string;
};

export type AlbumHeroSettings = {
  theme: 'album-package';
  textures: AlbumHeroTextures;
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
  englishTitle?: string;
  year: string;
  releaseStatus?: AlbumReleaseStatus;
  releaseDate?: string;
  description: string;
  detailedDescription?: string;
  coverImage?: string;
  cdLabelImage?: string;
  albumHero?: AlbumHeroSettings;
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
    id: 'ji-young-hee-ryu-haegeum-sanjo-2026',
    title: '조윤경 해금산조 – 지영희류',
    englishTitle: 'CHO YOUN KYOUNG HAEGEUM SANJO\nJi Young-hee Ryu',
    year: '2026',
    releaseStatus: 'coming-soon',
    description: '지영희류 해금산조 앨범.',
    coverImage: '/assets/albums/ji-young-hee-ryu-haegeum-sanjo-2026/web/front.png',
    albumHero: {
      theme: 'album-package',
      textures: {
        front: '/assets/albums/ji-young-hee-ryu-haegeum-sanjo-2026/web/front.png',
        back: '/assets/albums/ji-young-hee-ryu-haegeum-sanjo-2026/web/back.png',
        spineLeft: '/assets/albums/ji-young-hee-ryu-haegeum-sanjo-2026/web/spine.png',
      },
    },
    detailsPath: '/album/ji-young-hee-ryu-haegeum-sanjo-2026',
    tracks: [
      { number: 1, title: '진양', duration: '12:51' },
      { number: 2, title: '중모리', duration: '09:49' },
      { number: 3, title: '중중모리', duration: '03:06' },
      { number: 4, title: '굿거리', duration: '02:20' },
      { number: 5, title: '자진모리', duration: '02:43' },
      { number: 6, title: '짧은산조', duration: '12:06' },
    ],
    credits: [
      { role: 'Recording · Mixing · Mastering', names: ['떨기나무'] },
      { role: 'Distribution', names: ['조은뮤직'] },
      { role: 'Design', names: ['Soul.P'] },
    ],
  },
  {
    id: 'han-beom-su-haegeum-sanjo-2020',
    title: '조윤경 해금산조－한범수류',
    year: '2020',
    description: '한범수류 해금산조의 결을 담은 조윤경의 산조 음반.',
    featured: true,
    streamingLinks: [
      {
        platform: 'YouTube',
        label: 'LISTEN TO ALBUM',
        url: 'https://www.youtube.com/playlist?list=OLAK5uy_mfH8N47u4oTAamG6EjtwWWneiN-O2rAv8',
      },
    ],
  },
];

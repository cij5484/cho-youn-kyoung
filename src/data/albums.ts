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

export type AlbumHeroBackgroundAnchor = {
  sourceWidth: number;
  sourceHeight: number;
  x: number;
};

export type AlbumHeroPackageGeometry = {
  front: { width: number; height: number };
  back: { width: number; height: number };
  spine: { width: number; height: number };
};

export type AlbumHeroSettings = {
  theme: 'album-package';
  textures: AlbumHeroTextures;
  background: {
    desktop: string;
    mobile: string;
  };
  backgroundAnchor: {
    desktop: AlbumHeroBackgroundAnchor;
    mobile: AlbumHeroBackgroundAnchor;
  };
  packageGeometry?: AlbumHeroPackageGeometry;
};

export type AlbumDetailExperience = {
  theme: 'ji-young-hee-paper' | 'han-beom-su-paper';
  interior: { bookletPanel: string; trayPanel: string };
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
  detailExperience?: AlbumDetailExperience;
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
    englishTitle: 'CHO YOUN KYOUNG\nHAEGEUM SANJO\nJi Young-hee Ryu',
    year: '2026',
    releaseStatus: 'coming-soon',
    description: '지영희류 해금산조 앨범.',
    coverImage: '/assets/albums/ji-young-hee-ryu-haegeum-sanjo-2026/web/front.png',
    cdLabelImage: '/assets/albums/ji-young-hee-ryu-haegeum-sanjo-2026/web/cd-label.png',
    detailExperience: {
      theme: 'ji-young-hee-paper',
      interior: {
        bookletPanel: '/assets/albums/ji-young-hee-ryu-haegeum-sanjo-2026/web/interior-booklet.webp',
        trayPanel: '/assets/albums/ji-young-hee-ryu-haegeum-sanjo-2026/web/interior-tray.webp',
      },
    },
    albumHero: {
      theme: 'album-package',
      background: {
        desktop: '/assets/albums/ji-young-hee-ryu-haegeum-sanjo-2026/web/home-hero-desktop.png',
        mobile: '/assets/albums/ji-young-hee-ryu-haegeum-sanjo-2026/web/home-hero-mobile.png',
      },
      backgroundAnchor: {
        desktop: { sourceWidth: 3840, sourceHeight: 2160, x: 0.5 },
        mobile: { sourceWidth: 1440, sourceHeight: 2560, x: 0.5 },
      },
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
    booklet: {
      previewImages: Array.from({ length: 7 }, (_, index) => ({
        src: `/assets/albums/ji-young-hee-ryu-haegeum-sanjo-2026/viewer/booklet-0${index + 1}.webp`,
        alt: `지영희류 북클릿 ${index + 1}페이지`,
        label: `P${index + 1}`,
      })),
    },
  },
  {
    id: 'han-beom-su-haegeum-sanjo-2020',
    title: '조윤경 해금산조－한범수류',
    year: '2020',
    releaseStatus: 'released',
    releaseDate: '2020-11-19',
    description: '한범수류 해금산조의 결을 담은 조윤경의 산조 음반.',
    coverImage: '/assets/albums/han-beom-su-haegeum-sanjo-2020/web/front.webp',
    cdLabelImage: '/assets/albums/han-beom-su-haegeum-sanjo-2020/web/cd-label.png',
    detailExperience: {
      theme: 'han-beom-su-paper',
      interior: {
        bookletPanel: '/assets/albums/han-beom-su-haegeum-sanjo-2020/viewer/booklet-01.png',
        trayPanel: '/assets/albums/han-beom-su-haegeum-sanjo-2020/viewer/booklet-01.png',
      },
    },
    detailsPath: '/album/han-beom-su-haegeum-sanjo-2020',
    albumHero: {
      theme: 'album-package',
      background: {
        desktop: '/assets/albums/han-beom-su-haegeum-sanjo-2020/web/home-hero-desktop.png',
        mobile: '/assets/albums/han-beom-su-haegeum-sanjo-2020/web/home-hero-mobile.png',
      },
      backgroundAnchor: {
        desktop: { sourceWidth: 3840, sourceHeight: 2160, x: 0.43 },
        mobile: { sourceWidth: 1440, sourceHeight: 2560, x: 0.5 },
      },
      packageGeometry: {
        front: { width: 3320, height: 2946 },
        back: { width: 3317, height: 2946 },
        spine: { width: 182, height: 2946 },
      },
      textures: {
        front: '/assets/albums/han-beom-su-haegeum-sanjo-2020/web/front.webp',
        back: '/assets/albums/han-beom-su-haegeum-sanjo-2020/web/back.webp',
        spineLeft: '/assets/albums/han-beom-su-haegeum-sanjo-2020/web/spine.webp',
      },
    },
    featured: true,
    tracks: [
      { number: 1, title: '다스름' },
      { number: 2, title: '긴 산조 - 진양' },
      { number: 3, title: '긴 산조 - 중모리' },
      { number: 4, title: '긴 산조 - 중중모리' },
      { number: 5, title: '긴 산조 - 자진모리' },
    ],
    booklet: {
      previewImages: Array.from({ length: 11 }, (_, index) => ({
        src: `/assets/albums/han-beom-su-haegeum-sanjo-2020/viewer/booklet-${String(index + 1).padStart(2, '0')}.png`,
        alt: `한범수류 북클릿 ${index + 1}페이지`,
        label: `P${index + 1}`,
      })),
    },
    streamingLinks: [
      {
        platform: 'YouTube',
        label: 'LISTEN TO ALBUM',
        url: 'https://www.youtube.com/playlist?list=OLAK5uy_mfH8N47u4oTAamG6EjtwWWneiN-O2rAv8',
      },
    ],
  },
];

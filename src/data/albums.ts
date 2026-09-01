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
  theme: 'ji-young-hee-paper' | 'han-beom-su-paper' | 'pyeongjo-hoesang-paper' | 'yeongsan-hoesang-paper';
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
    id: 'yeongsan-hoesang-2026',
    title: '조윤경 해금정악 – 영산회상',
    englishTitle: 'CHO YOUN KYOUNG\nHAEGEUM JEONGAK\nYeongsan Hoesang',
    year: '2026',
    releaseStatus: 'coming-soon',
    description: '해금으로 듣는 영산회상.',
    coverImage: '/assets/albums/yeongsan-hoesang-2026/web/front.webp',
    cdLabelImage: '/assets/albums/yeongsan-hoesang-2026/web/cd-label.webp',
    detailExperience: {
      theme: 'yeongsan-hoesang-paper',
      interior: {
        bookletPanel: '/assets/albums/yeongsan-hoesang-2026/web/interior-booklet.webp',
        trayPanel: '/assets/albums/yeongsan-hoesang-2026/web/interior-tray.webp',
      },
    },
    albumHero: {
      theme: 'album-package',
      background: {
        desktop: '/assets/albums/yeongsan-hoesang-2026/web/home-hero-desktop.webp',
        mobile: '/assets/albums/yeongsan-hoesang-2026/web/home-hero-mobile.webp',
      },
      backgroundAnchor: {
        desktop: { sourceWidth: 2560, sourceHeight: 1440, x: 0.5 },
        mobile: { sourceWidth: 1440, sourceHeight: 2560, x: 0.5 },
      },
      packageGeometry: {
        front: { width: 1664, height: 1477 },
        back: { width: 1665, height: 1477 },
        spine: { width: 83, height: 1477 },
      },
      textures: {
        front: '/assets/albums/yeongsan-hoesang-2026/web/front.webp',
        back: '/assets/albums/yeongsan-hoesang-2026/web/back.webp',
        spineLeft: '/assets/albums/yeongsan-hoesang-2026/web/spine.webp',
      },
    },
    detailsPath: '/album/yeongsan-hoesang-2026',
    tracks: [
      {
        number: 1,
        title: '중광지곡 상령산',
        duration: '13:29',
        webAudioUrl: 'https://pub-dd5041e867ea448a9d025ebe26192631.r2.dev/yeongsan/01_sangryeongsan.mp3',
      },
      {
        number: 2,
        title: '중광지곡 중령산',
        duration: '10:26',
        webAudioUrl: 'https://pub-dd5041e867ea448a9d025ebe26192631.r2.dev/yeongsan/02_jungnyeongsan.mp3',
      },
      {
        number: 3,
        title: '중광지곡 세령산',
        duration: '03:42',
        webAudioUrl: 'https://pub-dd5041e867ea448a9d025ebe26192631.r2.dev/yeongsan/03_seryongsan.mp3',
      },
      {
        number: 4,
        title: '중광지곡 가락덜이',
        duration: '02:28',
        webAudioUrl: 'https://pub-dd5041e867ea448a9d025ebe26192631.r2.dev/yeongsan/04_garakdeori.mp3',
      },
      {
        number: 5,
        title: '중광지곡 상현도드리',
        duration: '04:19',
        webAudioUrl: 'https://pub-dd5041e867ea448a9d025ebe26192631.r2.dev/yeongsan/05_sanghyeondodeuri.mp3',
      },
      {
        number: 6,
        title: '중광지곡 하현도드리',
        duration: '02:58',
        webAudioUrl: 'https://pub-dd5041e867ea448a9d025ebe26192631.r2.dev/yeongsan/06_hahyeondodeuri.mp3',
      },
      {
        number: 7,
        title: '중광지곡 염불도드리',
        duration: '04:10',
        webAudioUrl: 'https://pub-dd5041e867ea448a9d025ebe26192631.r2.dev/yeongsan/07_yeombuldodeuri.mp3',
      },
      {
        number: 8,
        title: '중광지곡 타령',
        duration: '03:06',
        webAudioUrl: 'https://pub-dd5041e867ea448a9d025ebe26192631.r2.dev/yeongsan/08_taryeong.mp3',
      },
      {
        number: 9,
        title: '중광지곡 군악',
        duration: '04:04',
        webAudioUrl: 'https://pub-dd5041e867ea448a9d025ebe26192631.r2.dev/yeongsan/09_gunak.mp3',
      },
    ],
    participants: [
      { name: '조윤경', role: '해금' },
      { name: '이영섭', role: '장구' },
    ],
    credits: [
      { role: 'Producer', names: ['조윤경'] },
      { role: 'Recording · Mixing · Mastering', names: ['이음사운드'] },
      { role: 'Distribution', names: ['조은뮤직'] },
      { role: 'Design', names: ['Soul.P'] },
    ],
    booklet: {
      previewImages: Array.from({ length: 11 }, (_, index) => ({
        src: `/assets/albums/yeongsan-hoesang-2026/viewer/booklet-${String(index + 1).padStart(2, '0')}.webp`,
        alt: `영산회상 북클릿 ${index + 1}페이지`,
        label: `P${index + 1}`,
      })),
    },
  },
  {
    id: 'pyeongjo-hoesang-2026',
    title: '조윤경 해금정악 – 평조회상',
    englishTitle: 'CHO YOUN KYOUNG\nHAEGEUM JEONGAK\nPyeongjo Hoesang',
    year: '2026',
    releaseStatus: 'coming-soon',
    description: '해금으로 마주한 평조회상.',
    coverImage: '/assets/albums/pyeongjo-hoesang-2026/web/front.webp',
    cdLabelImage: '/assets/albums/pyeongjo-hoesang-2026/web/cd-label.webp',
    detailExperience: {
      theme: 'pyeongjo-hoesang-paper',
      interior: {
        bookletPanel: '/assets/albums/pyeongjo-hoesang-2026/web/interior-booklet.webp',
        trayPanel: '/assets/albums/pyeongjo-hoesang-2026/web/interior-tray.webp',
      },
    },
    albumHero: {
      theme: 'album-package',
      background: {
        desktop: '/assets/albums/pyeongjo-hoesang-2026/web/home-hero-desktop.webp',
        mobile: '/assets/albums/pyeongjo-hoesang-2026/web/home-hero-mobile.webp',
      },
      backgroundAnchor: {
        desktop: { sourceWidth: 2560, sourceHeight: 1440, x: 0.5 },
        mobile: { sourceWidth: 1440, sourceHeight: 2560, x: 0.5 },
      },
      packageGeometry: {
        front: { width: 1664, height: 1477 },
        back: { width: 1666, height: 1477 },
        spine: { width: 83, height: 1477 },
      },
      textures: {
        front: '/assets/albums/pyeongjo-hoesang-2026/web/front.webp',
        back: '/assets/albums/pyeongjo-hoesang-2026/web/back.webp',
        spineLeft: '/assets/albums/pyeongjo-hoesang-2026/web/spine.webp',
      },
    },
    detailsPath: '/album/pyeongjo-hoesang-2026',
    tracks: [
      {
        number: 1,
        title: '평조회상 상령산',
        duration: '13:36',
        webAudioUrl: 'https://pub-dd5041e867ea448a9d025ebe26192631.r2.dev/pyeongjo/01_sangryeongsan.mp3',
      },
      {
        number: 2,
        title: '평조회상 중령산',
        duration: '11:42',
        webAudioUrl: 'https://pub-dd5041e867ea448a9d025ebe26192631.r2.dev/pyeongjo/02_jungnyeongsan.mp3',
      },
      {
        number: 3,
        title: '평조회상 세령산',
        duration: '04:01',
        webAudioUrl: 'https://pub-dd5041e867ea448a9d025ebe26192631.r2.dev/pyeongjo/03_seryongsan.mp3',
      },
      {
        number: 4,
        title: '평조회상 가락덜이',
        duration: '02:31',
        webAudioUrl: 'https://pub-dd5041e867ea448a9d025ebe26192631.r2.dev/pyeongjo/04_garakdeori.mp3',
      },
      {
        number: 5,
        title: '평조회상 상현도드리',
        duration: '04:22',
        webAudioUrl: 'https://pub-dd5041e867ea448a9d025ebe26192631.r2.dev/pyeongjo/05_sanghyeondodeuri.mp3',
      },
      {
        number: 6,
        title: '평조회상 염불도드리',
        duration: '04:18',
        webAudioUrl: 'https://pub-dd5041e867ea448a9d025ebe26192631.r2.dev/pyeongjo/06_yeombuldodeuri.mp3',
      },
      {
        number: 7,
        title: '평조회상 타령',
        duration: '03:14',
        webAudioUrl: 'https://pub-dd5041e867ea448a9d025ebe26192631.r2.dev/pyeongjo/07_taryeong.mp3',
      },
      {
        number: 8,
        title: '평조회상 군악',
        duration: '04:13',
        webAudioUrl: 'https://pub-dd5041e867ea448a9d025ebe26192631.r2.dev/pyeongjo/08_gunak.mp3',
      },
    ],
    participants: [
      { name: '조윤경', role: '해금' },
      { name: '이영섭', role: '장구' },
    ],
    credits: [
      { role: 'Producer', names: ['조윤경'] },
      { role: 'Recording · Mixing · Mastering', names: ['이음사운드'] },
      { role: 'Distribution', names: ['조은뮤직'] },
      { role: 'Design', names: ['Soul.P'] },
    ],
    booklet: {
      previewImages: Array.from({ length: 11 }, (_, index) => ({
        src: `/assets/albums/pyeongjo-hoesang-2026/viewer/booklet-${String(index + 1).padStart(2, '0')}.webp`,
        alt: `평조회상 북클릿 ${index + 1}페이지`,
        label: `P${index + 1}`,
      })),
    },
  },
  {
    id: 'ji-young-hee-ryu-haegeum-sanjo-2026',
    title: '조윤경 해금산조 – 지영희류',
    englishTitle: 'CHO YOUN KYOUNG\nHAEGEUM SANJO\nJi Young-hee Ryu',
    year: '2026',
    releaseStatus: 'coming-soon',
    description: '지영희류 해금산조 앨범.',
    coverImage: '/assets/albums/ji-young-hee-ryu-haegeum-sanjo-2026/web/front.webp',
    cdLabelImage: '/assets/albums/ji-young-hee-ryu-haegeum-sanjo-2026/web/cd-label.webp',
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
        desktop: '/assets/albums/ji-young-hee-ryu-haegeum-sanjo-2026/web/home-hero-desktop.webp',
        mobile: '/assets/albums/ji-young-hee-ryu-haegeum-sanjo-2026/web/home-hero-mobile.webp',
      },
      backgroundAnchor: {
        desktop: { sourceWidth: 2560, sourceHeight: 1440, x: 0.5 },
        mobile: { sourceWidth: 1440, sourceHeight: 2560, x: 0.5 },
      },
      textures: {
        front: '/assets/albums/ji-young-hee-ryu-haegeum-sanjo-2026/web/front.webp',
        back: '/assets/albums/ji-young-hee-ryu-haegeum-sanjo-2026/web/back.webp',
        spineLeft: '/assets/albums/ji-young-hee-ryu-haegeum-sanjo-2026/web/spine.webp',
      },
    },
    detailsPath: '/album/ji-young-hee-ryu-haegeum-sanjo-2026',
    tracks: [
      {
        number: 1,
        title: '진양',
        duration: '12:51',
        webAudioUrl: 'https://pub-dd5041e867ea448a9d025ebe26192631.r2.dev/jiyounghee/01_jinyang.mp3',
      },
      {
        number: 2,
        title: '중모리',
        duration: '09:49',
        webAudioUrl: 'https://pub-dd5041e867ea448a9d025ebe26192631.r2.dev/jiyounghee/02_jungmori.mp3',
      },
      {
        number: 3,
        title: '중중모리',
        duration: '03:06',
        webAudioUrl: 'https://pub-dd5041e867ea448a9d025ebe26192631.r2.dev/jiyounghee/03_jungjungmori.mp3',
      },
      {
        number: 4,
        title: '굿거리',
        duration: '02:20',
        webAudioUrl: 'https://pub-dd5041e867ea448a9d025ebe26192631.r2.dev/jiyounghee/04_gutgeori.mp3',
      },
      {
        number: 5,
        title: '자진모리',
        duration: '02:43',
        webAudioUrl: 'https://pub-dd5041e867ea448a9d025ebe26192631.r2.dev/jiyounghee/05_jajinmori.mp3',
      },
      {
        number: 6,
        title: '짧은산조',
        duration: '12:06',
        webAudioUrl: 'https://pub-dd5041e867ea448a9d025ebe26192631.r2.dev/jiyounghee/06_short-sanjo.mp3',
      },
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
    coverImage: '/assets/albums/han-beom-su-haegeum-sanjo-2020/web/display/front.webp',
    cdLabelImage: '/assets/albums/han-beom-su-haegeum-sanjo-2020/web/display/cd-label.webp',
    detailExperience: {
      theme: 'han-beom-su-paper',
      interior: {
        bookletPanel: '/assets/albums/han-beom-su-haegeum-sanjo-2020/viewer/display/booklet-01.webp',
        trayPanel: '/assets/albums/han-beom-su-haegeum-sanjo-2020/viewer/display/booklet-01.webp',
      },
    },
    detailsPath: '/album/han-beom-su-haegeum-sanjo-2020',
    albumHero: {
      theme: 'album-package',
      background: {
        desktop: '/assets/albums/han-beom-su-haegeum-sanjo-2020/web/home-hero-desktop.webp',
        mobile: '/assets/albums/han-beom-su-haegeum-sanjo-2020/web/home-hero-mobile.webp',
      },
      backgroundAnchor: {
        desktop: { sourceWidth: 2560, sourceHeight: 1440, x: 0.43 },
        mobile: { sourceWidth: 1440, sourceHeight: 2560, x: 0.5 },
      },
      packageGeometry: {
        front: { width: 3320, height: 2946 },
        back: { width: 3317, height: 2946 },
        spine: { width: 182, height: 2946 },
      },
      textures: {
        front: '/assets/albums/han-beom-su-haegeum-sanjo-2020/web/display/front.webp',
        back: '/assets/albums/han-beom-su-haegeum-sanjo-2020/web/display/back.webp',
        spineLeft: '/assets/albums/han-beom-su-haegeum-sanjo-2020/web/spine.webp',
      },
    },
    featured: true,
    tracks: [
      {
        number: 1,
        title: '다스름',
        webAudioUrl: 'https://pub-dd5041e867ea448a9d025ebe26192631.r2.dev/hanbeomsu/01_daseureum.mp3',
      },
      {
        number: 2,
        title: '긴 산조 - 진양',
        webAudioUrl: 'https://pub-dd5041e867ea448a9d025ebe26192631.r2.dev/hanbeomsu/02_long-sanjo_jinyang.mp3',
      },
      {
        number: 3,
        title: '긴 산조 - 중모리',
        webAudioUrl: 'https://pub-dd5041e867ea448a9d025ebe26192631.r2.dev/hanbeomsu/03_long-sanjo_jungmori.mp3',
      },
      {
        number: 4,
        title: '긴 산조 - 중중모리',
        webAudioUrl: 'https://pub-dd5041e867ea448a9d025ebe26192631.r2.dev/hanbeomsu/04_long-sanjo_jungjungmori.mp3',
      },
      {
        number: 5,
        title: '긴 산조 - 자진모리',
        webAudioUrl: 'https://pub-dd5041e867ea448a9d025ebe26192631.r2.dev/hanbeomsu/05_long-sanjo_jajinmori.mp3',
      },
      {
        number: 6,
        title: '짧은 산조',
        webAudioUrl: 'https://pub-dd5041e867ea448a9d025ebe26192631.r2.dev/hanbeomsu/06_short-sanjo.mp3',
      },
    ],
    booklet: {
      previewImages: Array.from({ length: 11 }, (_, index) => ({
        src: `/assets/albums/han-beom-su-haegeum-sanjo-2020/viewer/display/booklet-${String(index + 1).padStart(2, '0')}.webp`,
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

export type MediaSection = 'featured' | 'selected' | 'special';

export type MediaKind = 'youtube-video' | 'local-video' | 'local-audio' | 'external';

export type MediaItem = {
  id: string;
  section: MediaSection;
  kind: MediaKind;
  title: string;
  subtitle?: string;
  description: string;
  year?: string;
  award?: string;
  youtubeId?: string;
  url?: string;
  label?: string;
  featured?: boolean;
};

export const mediaPageCopy = {
  eyebrow: 'PERFORMANCE · PRESS · ARCHIVE',
  title: 'MEDIA',
  description: '조윤경의 공연 영상과 언론 보도, 특별한 음악 기록을 모아 소개합니다.',
  pageTitle: 'MEDIA | CHO YOUN KYOUNG',
  metaDescription: '해금 연주자 조윤경의 공연 영상과 음반, 언론 보도와 특별한 음악 기록을 소개합니다.',
} as const;

export const mediaSections = [
  { id: 'featured', number: '01', title: 'FEATURED PERFORMANCE' },
  { id: 'press', number: '02', title: 'PRESS & ARTICLES' },
  { id: 'selected', number: '03', title: 'SELECTED PERFORMANCES' },
  { id: 'special', number: '04', title: 'SPECIAL ARCHIVE' },
] as const;

export const mediaItems: MediaItem[] = [
  {
    id: 'sixth-haegeum-recital', section: 'featured', kind: 'youtube-video',
    title: '조윤경 제6회 해금 독주회', description: '조윤경 제6회 해금 독주회 영상',
    youtubeId: 'bxdfMQT4Bi4', url: 'https://youtu.be/bxdfMQT4Bi4', label: 'WATCH PERFORMANCE', featured: true,
  },
  {
    id: 'busan-gugak-saturday-performance', section: 'selected', kind: 'youtube-video',
    title: '국립부산국악원 토요상설공연', description: '토요상설공연 중 조윤경 연주 영상',
    youtubeId: 'utanK8NrLxA', url: 'https://youtu.be/utanK8NrLxA', label: 'WATCH VIDEO',
  },
  {
    id: 'busan-gugak-vr-performance', section: 'selected', kind: 'youtube-video',
    title: '국립부산국악원 VR 공연', description: 'VR·360° 형식으로 감상하는 조윤경 참여 공연 영상',
    youtubeId: 'fIw-DL7Fisg', url: 'https://youtu.be/fIw-DL7Fisg', label: 'WATCH VR VIDEO',
  },
  {
    id: 'coreasori-2005', section: 'special', kind: 'youtube-video', year: '2005',
    title: '대학가요제', subtitle: 'COREASORI — 〈자유를 잃은 새〉', award: '3위 입상',
    description: '2005년 대학가요제 3위 입상 무대', youtubeId: 'ubp2ClVdMYI',
    url: 'https://youtu.be/ubp2ClVdMYI', label: 'WATCH ARCHIVE',
  },
];

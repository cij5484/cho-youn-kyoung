import { albums } from './albums';

export type ProfileGalleryImage = {
  src: string;
  thumbnail: string;
  alt: string;
  ariaLabel: string;
  objectPosition?: string;
  thumbnailObjectPosition?: string;
};

export type ProfilePerformance = {
  year: string;
  title: string;
  description?: string;
  href?: string;
  date?: string;
};

export const profile = {
  name: '조윤경',
  englishName: 'CHO YOUN KYOUNG',
  role: 'Haegeum Artist',
  currentPosition: '국립부산국악원 기악단 단원',
  profileImage: 'assets/artist/profile/portrait.jpg',
  galleryImages: [
    {
      src: 'assets/artist/profile/portrait.jpg',
      thumbnail: 'assets/artist/profile/portrait.jpg',
      alt: '검정 정장을 입고 손을 모은 해금 연주자 조윤경의 공식 프로필 사진',
      ariaLabel: '검정 정장을 입고 손을 모은 공식 프로필 사진 보기',
      objectPosition: 'center bottom',
      thumbnailObjectPosition: 'center top',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-01.jpg',
      thumbnail: 'assets/artist/gallery/profile-gallery-01.jpg',
      alt: '검정 정장을 입고 해금을 든 채 정면을 바라보는 조윤경의 프로필 사진',
      ariaLabel: '검정 정장을 입고 해금을 들고 정면을 보는 프로필 사진 보기',
      objectPosition: 'center center',
      thumbnailObjectPosition: 'center top',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-02.jpg',
      thumbnail: 'assets/artist/gallery/profile-gallery-02.jpg',
      alt: '검정 정장을 입고 해금 옆에서 옆모습을 보이는 조윤경의 프로필 사진',
      ariaLabel: '검정 정장을 입고 해금 옆에서 옆모습을 보는 프로필 사진 보기',
      objectPosition: 'center center',
      thumbnailObjectPosition: 'center top',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-03.jpg',
      thumbnail: 'assets/artist/gallery/profile-gallery-03.jpg',
      alt: '연두색 한복을 입고 검은 배경 앞에 앉아 있는 조윤경의 프로필 사진',
      ariaLabel: '연두색 한복을 입고 검은 배경 앞에 앉은 프로필 사진 보기',
      objectPosition: 'center center',
      thumbnailObjectPosition: 'center top',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-04.jpg',
      thumbnail: 'assets/artist/gallery/profile-gallery-04.jpg',
      alt: '흰 한복을 입고 해금을 들고 앉아 있는 조윤경의 전신 프로필 사진',
      ariaLabel: '흰 한복을 입고 해금을 들고 앉은 전신 프로필 사진 보기',
      objectPosition: 'center center',
      thumbnailObjectPosition: 'center top',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-05.jpg',
      thumbnail: 'assets/artist/gallery/profile-gallery-05.jpg',
      alt: '흰 한복을 입고 해금을 안고 있는 조윤경의 반신 프로필 사진',
      ariaLabel: '흰 한복을 입고 해금을 안은 반신 프로필 사진 보기',
      objectPosition: 'center center',
      thumbnailObjectPosition: 'center top',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-06.jpg',
      thumbnail: 'assets/artist/gallery/profile-gallery-06.jpg',
      alt: '흰 한복을 입고 손을 턱에 대고 앉아 있는 조윤경의 전신 프로필 사진',
      ariaLabel: '흰 한복을 입고 손을 턱에 대고 앉은 전신 프로필 사진 보기',
      objectPosition: 'center center',
      thumbnailObjectPosition: 'center top',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-07.jpg',
      thumbnail: 'assets/artist/gallery/profile-gallery-07.jpg',
      alt: '흰 한복을 입고 옆모습을 보이는 조윤경의 상반신 프로필 사진',
      ariaLabel: '흰 한복을 입고 옆모습을 보이는 상반신 프로필 사진 보기',
      objectPosition: 'center center',
      thumbnailObjectPosition: 'center top',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-08.webp',
      thumbnail: 'assets/artist/gallery/profile-gallery-08-thumb.webp',
      alt: '검은 의상을 입고 바닥에 앉아 활을 가로로 들고 있는 해금 연주자 조윤경의 프로필 사진',
      ariaLabel: '검은 의상을 입고 앉아 활을 든 프로필 사진 보기',
      objectPosition: 'center center', thumbnailObjectPosition: 'center center',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-09.webp', thumbnail: 'assets/artist/gallery/profile-gallery-09-thumb.webp',
      alt: '검은 의상을 입고 손을 모은 조윤경의 상반신 프로필 사진', ariaLabel: '검은 의상을 입고 손을 모은 상반신 프로필 사진 보기',
      objectPosition: 'center center', thumbnailObjectPosition: 'center center',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-10.webp', thumbnail: 'assets/artist/gallery/profile-gallery-10-thumb.webp',
      alt: '검은 의상을 입고 해금과 활을 든 채 아래를 바라보는 조윤경의 프로필 사진', ariaLabel: '검은 의상을 입고 해금과 활을 든 프로필 사진 보기',
      objectPosition: 'center center', thumbnailObjectPosition: 'center center',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-11.webp', thumbnail: 'assets/artist/gallery/profile-gallery-11-thumb.webp',
      alt: '검은 의상을 입고 해금을 든 채 서 있는 조윤경의 측면 프로필 사진', ariaLabel: '검은 의상을 입고 해금을 들고 선 측면 프로필 사진 보기',
      objectPosition: 'center center', thumbnailObjectPosition: 'center center',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-12.webp', thumbnail: 'assets/artist/gallery/profile-gallery-12-thumb.webp',
      alt: '검은 의상을 입고 해금을 든 채 옆을 바라보는 조윤경의 프로필 사진', ariaLabel: '검은 의상을 입고 해금을 들고 옆을 바라보는 프로필 사진 보기',
      objectPosition: 'center center', thumbnailObjectPosition: 'center center',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-13.webp', thumbnail: 'assets/artist/gallery/profile-gallery-13-thumb.webp',
      alt: '밝은 한복을 입고 해금을 든 조윤경의 상반신 프로필 사진', ariaLabel: '밝은 한복을 입고 해금을 든 상반신 프로필 사진 보기',
      objectPosition: 'center center', thumbnailObjectPosition: 'center center',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-14.webp', thumbnail: 'assets/artist/gallery/profile-gallery-14-thumb.webp',
      alt: '밝은 한복을 입고 해금을 들고 서 있는 조윤경의 전신 프로필 사진', ariaLabel: '밝은 한복을 입고 해금을 들고 선 전신 프로필 사진 보기',
      objectPosition: 'center center', thumbnailObjectPosition: 'center center',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-15.webp', thumbnail: 'assets/artist/gallery/profile-gallery-15-thumb.webp',
      alt: '푸른 저고리와 밝은 치마의 한복을 입은 조윤경의 프로필 사진', ariaLabel: '푸른 저고리의 한복을 입은 프로필 사진 보기',
      objectPosition: 'center center', thumbnailObjectPosition: 'center center',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-16.webp', thumbnail: 'assets/artist/gallery/profile-gallery-16-thumb.webp',
      alt: '흑백으로 촬영된 한복 차림의 조윤경이 해금과 활을 들고 있는 프로필 사진', ariaLabel: '한복을 입고 해금과 활을 든 흑백 프로필 사진 보기',
      objectPosition: 'center center', thumbnailObjectPosition: 'center center',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-17.webp', thumbnail: 'assets/artist/gallery/profile-gallery-17-thumb.webp',
      alt: '연두색 저고리의 한복을 입고 해금과 활을 든 조윤경의 프로필 사진', ariaLabel: '연두색 한복을 입고 해금과 활을 든 프로필 사진 보기',
      objectPosition: 'center center', thumbnailObjectPosition: 'center center',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-18.webp', thumbnail: 'assets/artist/gallery/profile-gallery-18-thumb.webp',
      alt: '연두색 저고리의 한복을 입고 서 있는 조윤경의 프로필 사진', ariaLabel: '연두색 한복을 입고 서 있는 프로필 사진 보기',
      objectPosition: 'center center', thumbnailObjectPosition: 'center center',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-19.webp', thumbnail: 'assets/artist/gallery/profile-gallery-19-thumb.webp',
      alt: '밝은 한복을 입고 손을 모은 조윤경의 프로필 사진', ariaLabel: '밝은 한복을 입고 손을 모은 프로필 사진 보기',
      objectPosition: 'center center', thumbnailObjectPosition: 'center center',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-20.webp', thumbnail: 'assets/artist/gallery/profile-gallery-20-thumb.webp',
      alt: '연두빛 한복을 입고 전통 머리장식을 한 조윤경의 프로필 사진', ariaLabel: '연두빛 한복과 전통 머리장식의 프로필 사진 보기',
      objectPosition: 'center center', thumbnailObjectPosition: 'center center',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-21.webp', thumbnail: 'assets/artist/gallery/profile-gallery-21-thumb.webp',
      alt: '검은 한복 스타일 의상을 입은 조윤경의 프로필 사진', ariaLabel: '검은 한복 스타일 의상의 프로필 사진 보기',
      objectPosition: 'center center', thumbnailObjectPosition: 'center center',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-22.webp', thumbnail: 'assets/artist/gallery/profile-gallery-22-thumb.webp',
      alt: '검은 한복 스타일 의상을 입고 정면을 바라보는 조윤경의 프로필 사진', ariaLabel: '검은 한복 스타일 의상으로 정면을 바라보는 프로필 사진 보기',
      objectPosition: 'center center', thumbnailObjectPosition: 'center center',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-23.webp', thumbnail: 'assets/artist/gallery/profile-gallery-23-thumb.webp',
      alt: '검은 의상을 입고 어두운 배경에서 아래를 바라보는 조윤경의 프로필 사진', ariaLabel: '어두운 배경에서 아래를 바라보는 프로필 사진 보기',
      objectPosition: 'center center', thumbnailObjectPosition: 'center center',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-24.webp', thumbnail: 'assets/artist/gallery/profile-gallery-24-thumb.webp',
      alt: '검은 의상을 입고 어두운 배경에서 촬영한 조윤경의 상반신 프로필 사진', ariaLabel: '어두운 배경의 상반신 프로필 사진 보기',
      objectPosition: 'center center', thumbnailObjectPosition: 'center center',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-25.webp', thumbnail: 'assets/artist/gallery/profile-gallery-25-thumb.webp',
      alt: '따뜻한 갈색 배경과 활의 선 사이에서 아래를 바라보는 조윤경의 프로필 사진', ariaLabel: '활의 선과 함께 촬영한 프로필 사진 보기',
      objectPosition: 'center center', thumbnailObjectPosition: 'center center',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-26.webp', thumbnail: 'assets/artist/gallery/profile-gallery-26-thumb.webp',
      alt: '해금과 활의 선 너머로 조윤경의 얼굴을 담은 프로필 사진', ariaLabel: '해금과 활의 선 너머로 촬영한 프로필 사진 보기',
      objectPosition: 'center center', thumbnailObjectPosition: 'center center',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-27.webp', thumbnail: 'assets/artist/gallery/profile-gallery-27-thumb.webp',
      alt: '따뜻한 조명 아래 옆모습을 담은 조윤경의 프로필 사진', ariaLabel: '따뜻한 조명 아래 촬영한 측면 프로필 사진 보기',
      objectPosition: 'center center', thumbnailObjectPosition: 'center center',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-28.webp', thumbnail: 'assets/artist/gallery/profile-gallery-28-thumb.webp',
      alt: '갈색 배경 앞에서 아래를 바라보는 조윤경의 프로필 사진', ariaLabel: '갈색 배경에서 아래를 바라보는 프로필 사진 보기',
      objectPosition: 'center center', thumbnailObjectPosition: 'center center',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-29.webp', thumbnail: 'assets/artist/gallery/profile-gallery-29-thumb.webp',
      alt: '따뜻한 조명 아래 얼굴을 가까이 담은 조윤경의 프로필 사진', ariaLabel: '따뜻한 조명의 클로즈업 프로필 사진 보기',
      objectPosition: 'center center', thumbnailObjectPosition: 'center center',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-30.webp', thumbnail: 'assets/artist/gallery/profile-gallery-30-thumb.webp',
      alt: '흰 배경에서 검은 한복을 입은 조윤경의 프로필 사진', ariaLabel: '흰 배경에서 검은 한복을 입은 프로필 사진 보기',
      objectPosition: 'center center', thumbnailObjectPosition: 'center center',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-31.webp', thumbnail: 'assets/artist/gallery/profile-gallery-31-thumb.webp',
      alt: '검은 한복을 입고 붉은 띠를 두른 조윤경의 프로필 사진', ariaLabel: '검은 한복과 붉은 띠의 프로필 사진 보기',
      objectPosition: 'center center', thumbnailObjectPosition: 'center center',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-32.webp', thumbnail: 'assets/artist/gallery/profile-gallery-32-thumb.webp',
      alt: '노란 한복을 입은 조윤경의 얼굴을 가까이 담은 프로필 사진', ariaLabel: '노란 한복의 클로즈업 프로필 사진 보기',
      objectPosition: 'center center', thumbnailObjectPosition: 'center center',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-33.webp', thumbnail: 'assets/artist/gallery/profile-gallery-33-thumb.webp',
      alt: '노란 한복을 입고 서 있는 조윤경의 전신 프로필 사진', ariaLabel: '노란 한복을 입고 선 전신 프로필 사진 보기',
      objectPosition: 'center center', thumbnailObjectPosition: 'center center',
    },
    {
      src: 'assets/artist/gallery/profile-gallery-34.webp', thumbnail: 'assets/artist/gallery/profile-gallery-34-thumb.webp',
      alt: '붉은 저고리와 보랏빛 치마의 한복을 입고 아래를 바라보는 조윤경의 프로필 사진', ariaLabel: '붉은 저고리와 보랏빛 치마의 한복 프로필 사진 보기',
      objectPosition: 'center center', thumbnailObjectPosition: 'center center',
    },
  ] satisfies ProfileGalleryImage[],
  biography: [
    '조윤경은 해금 연주자로, 국립국악학교와 서울국악예술고등학교를 거쳐 한양대학교 음악대학 국악과 및 동 대학원 국악학과를 졸업하고 한양대학교 음악학박사(D.M.A.) 학위를 받았다.',
    '제27회 온나라 국악경연대회 해금부문 금상을 수상했으며, 2009년부터 개인 연주와 창작음악 시리즈를 이어 오고 있다.',
    '현재 국립부산국악원 기악단 단원이며 국가무형유산 종묘제례악 이수자, 우리음악앙상블 새, 생(New,生) 동인으로 활동하고 있다.',
  ],
  education: [
    '국립국악학교 졸업',
    '서울국악예술고등학교 졸업 (현재 국립전통예술고등학교)',
    '한양대학교 음악대학 국악과 졸업',
    '한양대학교 대학원 국악학과 졸업',
    '한양대학교 음악학박사(D.M.A.)',
  ],
  awards: ['제27회 온나라 국악경연대회 해금부문 금상'],
  positions: [
    '국립부산국악원 기악단 단원',
    '국가무형유산 종묘제례악 이수자',
    '우리음악앙상블 새, 생(New,生) 동인',
    '전 한양대학교 겸임교수',
    '전 부산대학교 강사',
    '전 부산예술대학교 겸임교수',
    '전 부산예술중·고등학교 강사',
  ],
  performances: [
    {
      year: '2026',
      title: '풀고, 엮다',
      date: '2026-09-22',
      description: '해금상령산풀이 · 관악영산회상',
      href: '/performance/haegeum-jeongak-2026-09-22',
    },
    { year: '2009', title: '활의 노래' },
    { year: '2011', title: '활의 노래Ⅱ' },
    { year: '2014', title: '편' },
    { year: '2016', title: '전환－옛것을 바라보는 시점의 변화' },
    { year: '2018', title: '조윤경의 해금 V' },
    { year: '2020', title: '전환 II－옛것을 바라보는 시점의 변화' },
    { year: '2022', title: '조윤경의 해금 VII: 창작음악시리즈－5인의 작곡가' },
    { year: '2023', title: '산조길, 하나－지영희류 해금산조' },
    {
      year: '2026',
      title: '산조길, 둘',
      date: '2026-08-16',
      description: '한범수류 해금산조',
      href: '/performance/sanjo-gil-2026-08-16',
    },
    {
      year: '2026',
      title: '해금, 시대를 잇다',
      date: '2026-08-02',
      description: '해금 창작곡의 변천',
      href: '/performance/haegeum-2026-08-02',
    },
  ] satisfies ProfilePerformance[],
  discography: albums,
} as const;

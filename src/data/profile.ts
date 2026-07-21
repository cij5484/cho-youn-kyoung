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
};

export const profile = {
  name: '조윤경',
  englishName: 'CHO YOUN KYOUNG',
  role: 'Haegeum Artist',
  currentPosition: '국립부산국악원 기악단 단원',
  profileImage: 'images/profile/cho-youn-kyoung-profile.jpg',
  galleryImages: [
    {
      src: 'images/profile/cho-youn-kyoung-profile.jpg',
      thumbnail: 'images/profile/cho-youn-kyoung-profile.jpg',
      alt: '검정 정장을 입고 손을 모은 해금 연주자 조윤경의 공식 프로필 사진',
      ariaLabel: '검정 정장을 입고 손을 모은 공식 프로필 사진 보기',
      objectPosition: 'center bottom',
      thumbnailObjectPosition: 'center top',
    },
    {
      src: 'images/profile/gallery/profile-gallery-01.jpg',
      thumbnail: 'images/profile/gallery/profile-gallery-01.jpg',
      alt: '검정 정장을 입고 해금을 든 채 정면을 바라보는 조윤경의 프로필 사진',
      ariaLabel: '검정 정장을 입고 해금을 들고 정면을 보는 프로필 사진 보기',
      objectPosition: 'center center',
      thumbnailObjectPosition: 'center top',
    },
    {
      src: 'images/profile/gallery/profile-gallery-02.jpg',
      thumbnail: 'images/profile/gallery/profile-gallery-02.jpg',
      alt: '검정 정장을 입고 해금 옆에서 옆모습을 보이는 조윤경의 프로필 사진',
      ariaLabel: '검정 정장을 입고 해금 옆에서 옆모습을 보는 프로필 사진 보기',
      objectPosition: 'center center',
      thumbnailObjectPosition: 'center top',
    },
    {
      src: 'images/profile/gallery/profile-gallery-03.jpg',
      thumbnail: 'images/profile/gallery/profile-gallery-03.jpg',
      alt: '연두색 한복을 입고 검은 배경 앞에 앉아 있는 조윤경의 프로필 사진',
      ariaLabel: '연두색 한복을 입고 검은 배경 앞에 앉은 프로필 사진 보기',
      objectPosition: 'center center',
      thumbnailObjectPosition: 'center top',
    },
    {
      src: 'images/profile/gallery/profile-gallery-04.jpg',
      thumbnail: 'images/profile/gallery/profile-gallery-04.jpg',
      alt: '흰 한복을 입고 해금을 들고 앉아 있는 조윤경의 전신 프로필 사진',
      ariaLabel: '흰 한복을 입고 해금을 들고 앉은 전신 프로필 사진 보기',
      objectPosition: 'center center',
      thumbnailObjectPosition: 'center top',
    },
    {
      src: 'images/profile/gallery/profile-gallery-05.jpg',
      thumbnail: 'images/profile/gallery/profile-gallery-05.jpg',
      alt: '흰 한복을 입고 해금을 안고 있는 조윤경의 반신 프로필 사진',
      ariaLabel: '흰 한복을 입고 해금을 안은 반신 프로필 사진 보기',
      objectPosition: 'center center',
      thumbnailObjectPosition: 'center top',
    },
    {
      src: 'images/profile/gallery/profile-gallery-06.jpg',
      thumbnail: 'images/profile/gallery/profile-gallery-06.jpg',
      alt: '흰 한복을 입고 손을 턱에 대고 앉아 있는 조윤경의 전신 프로필 사진',
      ariaLabel: '흰 한복을 입고 손을 턱에 대고 앉은 전신 프로필 사진 보기',
      objectPosition: 'center center',
      thumbnailObjectPosition: 'center top',
    },
    {
      src: 'images/profile/gallery/profile-gallery-07.jpg',
      thumbnail: 'images/profile/gallery/profile-gallery-07.jpg',
      alt: '흰 한복을 입고 옆모습을 보이는 조윤경의 상반신 프로필 사진',
      ariaLabel: '흰 한복을 입고 옆모습을 보이는 상반신 프로필 사진 보기',
      objectPosition: 'center center',
      thumbnailObjectPosition: 'center top',
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
      title: '해금, 시대를 잇다',
      description: '해금 창작곡의 변천',
      href: '/performance/haegeum-2026-08-02',
    },
  ] satisfies ProfilePerformance[],
  discography: albums,
} as const;

import { albums } from './albums';

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

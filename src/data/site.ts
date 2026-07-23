export const site = {
  artistName: 'CHO YOUN KYOUNG',
  artistRole: 'Haegeum Artist',
  title: 'CHO YOUN KYOUNG | Haegeum Artist',
  description: '해금 연주자 조윤경의 공식 웹사이트. 공연, 프로필, 아카이브를 소개합니다.',
  siteName: 'CHO YOUN KYOUNG',
  locale: 'ko_KR',
  contactEmail: 'cykguri@naver.com',
  instagramHandle: '@cho.younkyoung',
  instagramUrl: 'https://www.instagram.com/cho.younkyoung/',
  inquiries: '공연 및 협업 문의',
  affiliation: '국립부산국악원 기악단 단원',
  siteUrl: 'https://choyounkyoung.com/',
  shareImage: 'https://choyounkyoung.com/images/archive/2026-08-02/2026-08-02-poster.png',
} as const;

export const navigationItems = [
  { label: 'HOME', path: '/' },
  { label: 'PERFORMANCE', path: '/performance' },
  { label: 'ABOUT', path: '/about' },
  { label: 'CONTACT', path: '/contact' },
] as const;

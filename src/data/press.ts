export type PressArticle = {
  id: string;
  outlet: string;
  publishedDate: string;
  title: string;
  shortDescription?: string;
  url: string;
  category?: 'NEWS' | 'INTERVIEW' | 'REVIEW';
  label?: string;
};

// Add only articles whose outlet, title, date, and canonical URL are verified.
export const pressArticles: PressArticle[] = [
  {
    id: '2026-nc-sanjo-gil-dul',
    outlet: '뉴스컬처',
    publishedDate: '2026-08-03',
    title: '[전통N] 조윤경, 육자배기서 한범수류까지… 해금으로 걷는 ‘산조길, 둘’',
    url: 'https://www.nc.press/news/articleView.html?idxno=622433',
    category: 'NEWS',
  },
  {
    id: '2026-mhns-sanjo-gil-dul',
    outlet: '문화뉴스',
    publishedDate: '2026-07-27',
    title: "해금산조의 결 따라 걷는 한 시간…'산조길, 둘' 16일 공연",
    url: 'https://www.mhns.co.kr/news/articleView.html?idxno=754560',
    category: 'NEWS',
  },
  {
    id: '2022-mhns-five-composers',
    outlet: '문화뉴스',
    publishedDate: '2022-04-22',
    title: "조윤경의 해금독주회, '5인의 작곡가' 개최",
    url: 'https://www.mhns.co.kr/news/articleView.html?idxno=525654',
    category: 'NEWS',
  },
  {
    id: '2022-globalnewsagency-haegeum-vii',
    outlet: '글로벌뉴스통신',
    publishedDate: '2022-04-21',
    title: '조윤경의 7번째 해금 독주회 개최',
    url: 'https://www.globalnewsagency.kr/news/articleView.html?idxno=259089',
    category: 'NEWS',
  },
  {
    id: '2022-krnews21-haegeum-vii',
    outlet: '뉴스21',
    publishedDate: '2022-04-21',
    title: '조윤경의 7번째 해금독주회 <조윤경의 해금 VII>',
    url: 'https://www.krnews21.co.kr/news/298592',
    category: 'NEWS',
  },
  {
    id: '2014-busan-third-recital',
    outlet: '부산일보',
    publishedDate: '2014-09-29',
    title: '거친 듯 정교한 해금 선율 어때요?',
    url: 'https://www.busan.com/view/busan/view.php?code=20140929000046',
    category: 'NEWS',
  },
  {
    id: '2014-ohmynews-third-recital',
    outlet: '오마이뉴스',
    publishedDate: '2014-09-19',
    title: '부산국악원 해금 연주자 조윤경, 독주회 마련',
    url: 'https://www.ohmynews.com/NWS_Web/View/at_pg.aspx?CNTN_CD=A0002034717',
    category: 'NEWS',
  },
  {
    id: '2014-segye-third-recital',
    outlet: '세계일보',
    publishedDate: '2014-09-18',
    title: "조윤경 제3회 해금독주회 '編(편)'10월1일 열린다",
    url: 'https://www.segye.com/newsView/20140918003777',
    category: 'NEWS',
  },
  {
    id: '2008-newsis-sorinamu',
    outlet: '뉴시스',
    publishedDate: '2008-11-11',
    title: '소리나무의 해금 조윤경',
    url: 'https://n.news.naver.com/mnews/article/003/0002372996?sid=103',
    category: 'NEWS',
  },
];

export const pressArticlesNewestFirst = [...pressArticles].sort((a, b) =>
  b.publishedDate.localeCompare(a.publishedDate),
);

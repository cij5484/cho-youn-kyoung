export type PerformanceCollaborator = {
  id: string;
  name: string;
  role: string;
  image: string;
  shortBio: string;
  fullBio: string[];
  participatingWorks: string[];
};

export type ProgramWork = {
  number: number;
  composer: string;
  composerYears: string;
  title: string;
  year: string;
  instrumentation?: string[];
  composerNote: string;
  workNote: string;
};

export type ProgramEra = {
  roman: string;
  title: string;
  description: string;
  works: ProgramWork[];
};

export type ArchiveMaterial = {
  label: string;
  viewLabel: string;
  url?: string;
  downloadUrl?: string;
  previewImageUrl?: string;
};

export type Performance = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  displayDate: string;
  venue: string;
  performer: string;
  featured: boolean;
  heroImage: string;
  posterImage?: string;
  archiveLabel: string;
  listDescription: string;
  introduction: string[];
  artistNote: string[];
  artistSignature: string;
  programEras: ProgramEra[];
  collaborators: PerformanceCollaborator[];
  archiveMaterials?: ArchiveMaterial[];
  posterUrl?: string;
  leafletUrl?: string;
  posterPreviewImageUrl?: string;
  leafletPreviewImageUrl?: string;
};

const collaborators: PerformanceCollaborator[] = [
  {
    id: 'yoon-seung-hwan',
    name: '윤승환',
    role: '장구·타악',
    image: 'images/performers/yoon-seung-hwan.jpg',
    shortBio: '부산대학교 한국음악학과 및 동 대학원 졸업. 국립부산국악원 기악단 부수석.',
    fullBio: ['부산대학교 한국음악학과 및 동 대학원 졸업', '한양대학교 음악연주학 박사(D.M.A.)', '서울시 무형유산 제25호 판소리고법 이수자', '국립부산국악원 기악단 부수석'],
    participatingWorks: ['해금과 장구를 위한 소곡', '춤사리기', '소리 Sori'],
  },
  {
    id: 'jin-min-jin',
    name: '진민진',
    role: '아쟁',
    image: 'images/performers/jin-min-jin.jpg',
    shortBio: '국립부산국악원 기악단 아쟁 단원. 부산대학교 한국음악학 박사(Ph.D.).',
    fullBio: ['국립부산국악원 기악단 아쟁 단원', '국가무형유산 종묘제례악 이수자', '부산광역시무형유산 아쟁산조 이수자', '부산대학교 한국음악학 박사(Ph.D.)'],
    participatingWorks: ['소리 Sori'],
  },
  {
    id: 'eo-yoon-seok',
    name: '어윤석',
    role: '25현가야금',
    image: 'images/performers/eo-yoon-seok.jpg',
    shortBio: '제24회 구례전국가야금경연대회 대통령상. 부산시립국악관현악단 상임단원.',
    fullBio: ['한양대학교 졸업 및 동 대학원 재학', '제24회 구례전국가야금경연대회 대통령상', '부산시립국악관현악단 상임단원'],
    participatingWorks: ['활의 노래'],
  },
  {
    id: 'yang-seung-hwan',
    name: '양승환',
    role: '사회',
    image: 'images/performers/yang-seung-hwan.jpg',
    shortBio: 'KBS 국악대상 작곡상 수상. 국악방송 21C 한국음악프로젝트 예술감독 역임.',
    fullBio: ['KBS 국악대상 작곡상 수상', '국악방송 21C 한국음악프로젝트 예술감독 역임', '작곡집단 오선지한음 대표', '대구문화예술회관 국악인큐베이팅 사업 JUMP UP 음악감독', '영남대학교 겸임교수', '한국예술종합대학교 전통예술원 출강'],
    participatingWorks: ['해금, 시대를 잇다'],
  },
];

export const performances: Performance[] = [
  {
    id: 'haegeum-2026-08-02',
    title: '해금, 시대를 잇다',
    subtitle: '해금 창작곡의 변천',
    date: '2026-08-02',
    displayDate: '2026. 8. 2. (일) 16:00',
    venue: '향사아트센터',
    performer: '조윤경',
    featured: true,
    heroImage: 'images/hero/hero-background-v2.png',
    archiveLabel: 'HAEGEUM RECITAL 2026',
    listDescription: '해금 창작곡의 변천을 기록하다',
    introduction: [
      '창작국악은 전통음악의 계승에 머무르지 않고 시대의 변화와 새로운 예술적 요구를 반영하며 발전해 온 현대 국악의 중요한 흐름이다. 1960년대 이후 독주곡, 실내악, 국악관현악 등 다양한 창작 작품이 본격적으로 발표되었고, 작곡가들은 전통 장단과 선율, 시김새에 현대적인 음악 언어를 접목해 새로운 가능성을 모색하였다.',
      '이번 독주회는 1966년 김흥교의 「해금과 장구를 위한 소곡」부터 김기수, 김영재, 이해식, 이정면, 도널드 리드 워맥의 작품까지 시대별 대표 작품을 따라가며 해금이 전통의 울림을 간직한 채 현대의 예술 언어로 확장되어 온 과정을 조망한다.',
    ],
    artistNote: [
      '해금은 오랜 시간 우리 음악의 전통을 이어온 악기이지만, 동시에 끊임없는 창작을 통해 새로운 시대를 만들어가고 있는 현재의 악기이기도 합니다.',
      '이번 독주회 「해금, 시대를 잇다 ― 해금 창작곡의 변천」은 해금 창작음악이 걸어온 흐름을 되짚어 보고, 시대마다 새롭게 확장되어 온 해금의 음악적 가능성을 함께 나누고자 마련하였습니다.',
      '이번 무대에서는 김흥교, 김기수, 김영재, 이해식, 이정면, 그리고 도널드 리드 워맥의 작품을 통해 각 시대를 대표하는 음악적 언어와 해금의 다양한 표현을 만나볼 수 있습니다. 서로 다른 시대와 미학을 담은 작품들은 해금이라는 하나의 악기를 통해 연결되며, 오늘날의 창작 해금음악이 형성되어 온 과정을 보여줍니다.',
      '전통은 과거에 머무는 것이 아니라 현재를 통해 이어지고 미래로 확장될 때 더욱 깊은 의미를 지닙니다. 이 무대가 해금 창작음악의 발자취를 함께 돌아보고, 앞으로 펼쳐질 새로운 가능성을 함께 상상하는 시간이 되기를 바랍니다.',
      '귀한 걸음으로 이 자리를 함께해 주신 모든 분들께 진심으로 감사드립니다.',
    ],
    artistSignature: '조윤경',
    programEras: [
      { roman: 'Ⅰ', title: '창작의 시작', description: '1960–70년대 창작 해금음악의 출발점과 전통 어법의 현대적 재구성', works: [
        { number: 1, composer: '김흥교', composerYears: '1918–1995', title: '해금과 장구를 위한 소곡', year: '1966', instrumentation: ['장구: 윤승환'], composerNote: '국악 창작 초창기부터 작품 활동을 이어온 작곡가로, 전통음악의 어법을 바탕으로 해금을 비롯한 국악기의 현대적 가능성을 탐구하였다.', workNote: '해금과 장구라는 기본적인 편성을 통해 해금의 섬세한 음색과 장단의 긴밀한 호흡을 보여준다. 전통적인 선율 어법과 절제된 현대적 작곡기법을 통해 창작 해금음악의 출발점을 보여준다.' },
        { number: 2, composer: '김기수', composerYears: '1917–1986', title: '등롱', year: '1978', composerNote: '국악의 현대화를 이끈 작곡가이자 교육자로, 한국적 선율과 리듬을 현대적인 감각으로 재구성하였다.', workNote: '은은한 등불이 어둠을 밝히듯 서정적이고 깊이 있는 정서를 담는다. 해금 특유의 유연한 음색과 섬세한 감정의 흐름을 통해 전통과 현대의 균형을 보여준다.' },
      ] },
      { roman: 'Ⅱ', title: '해금의 확장', description: '1980–90년대 연주 기법과 장단, 춤의 호흡으로 넓어진 해금의 표현 세계', works: [
        { number: 3, composer: '김영재', composerYears: '1947–', title: '적념', year: '1989', composerNote: '해금 연주자이자 작곡가로서 연주 경험을 바탕으로 해금의 표현 영역을 확장해 왔다.', workNote: '‘쌓인 생각’이라는 제목처럼 내면의 깊은 사색과 감정을 표현한다. 폭넓은 음역과 섬세한 활의 움직임을 통해 해금의 농밀한 정서를 보여준다.' },
        { number: 4, composer: '이해식', composerYears: '1943–2010', title: '춤사리기', year: '1999', instrumentation: ['장구: 윤승환'], composerNote: '전통 장단과 현대적 작곡기법을 접목하여 한국적 리듬의 현대적 가능성을 탐구한 작곡가이다.', workNote: '한국 춤의 움직임과 호흡을 음악으로 형상화한다. 역동적인 장단과 유려한 선율, 즉흥성과 생동감이 어우러진다.' },
      ] },
      { roman: 'Ⅲ', title: '새로운 시대를 향하여', description: '2000년대 이후 확장된 음향, 현대적 연주법, 세계 음악 언어와의 만남', works: [
        { number: 5, composer: '이정면', composerYears: '1969–', title: '활의 노래', year: '2009', instrumentation: ['25현가야금: 어윤석'], composerNote: '현대적 음악어법과 국악기의 특성을 결합하며 해금의 새로운 연주기법과 음향 가능성을 탐구해 왔다.', workNote: '활의 움직임 자체를 음악의 중심 요소로 삼는다. 다양한 활쓰기, 음색 변화, 현대적인 연주기법을 통해 해금의 확장성과 실험성을 보여준다.' },
        { number: 6, composer: 'Donald Reid Womack', composerYears: '1970–', title: '소리 Sori', year: '2014', instrumentation: ['아쟁: 진민진', '타악: 윤승환'], composerNote: '미국 출신 작곡가로 한국 전통음악과 국악기에 깊은 관심을 가지고 한국의 음악적 정서를 현대적 작곡기법과 결합해 왔다.', workNote: '해금의 음색과 호흡, 미세한 음의 움직임을 현대적으로 조명한다. 전통과 현대, 동양과 서양이 만나는 가능성을 보여주며, 해금이 세계적인 현대악기로 확장되는 현재를 상징한다. 원곡은 해금·첼로·타악 편성이지만 이번 공연에서는 해금·아쟁·타악으로 재편성한다.' },
      ] },
    ],
    collaborators,
    archiveMaterials: [
      {
        label: 'POSTER',
        viewLabel: 'VIEW POSTER',
        url: 'files/2026-08-02-poster.pdf',
        downloadUrl: 'files/2026-08-02-poster.pdf',
      },
      {
        label: 'LEAFLET',
        viewLabel: 'VIEW LEAFLET',
        url: 'files/2026-08-02-leaflet.pdf',
        downloadUrl: 'files/2026-08-02-leaflet.pdf',
      },
    ],
  },
];

export const getFeaturedPerformance = () => {
  const featured = performances.find((performance) => performance.featured);
  if (featured) return featured;

  const today = new Date().toISOString().slice(0, 10);
  return [...performances].filter((performance) => performance.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0] ?? performances[0];
};

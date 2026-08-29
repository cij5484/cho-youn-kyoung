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

export type ArchivePreviewImage = {
  src: string;
  alt: string;
  label?: string;
};

export type ArchiveMaterial = {
  label: 'POSTER' | 'LEAFLET';
  viewLabel: string;
  previewImages: ArchivePreviewImage[];
  downloadUrl?: string;
  downloadLabel?: string;
};

export type HomeHeroSettings = {
  theme: 'haegeum-recital' | 'sanjo-matiere' | 'haegeum-jeongak';
};

export type Performance = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  displayDate: string;
  venue: string;
  venueAddress?: string;
  venueUrl?: string;
  performer: string;
  featured: boolean;
  heroImage: string;
  heroImageMobile?: string;
  archiveLabel: string;
  listDescription: string;
  introduction: string[];
  artistNote: string[];
  artistNoteLeadLines?: string[];
  artistSignature: string;
  programEras: ProgramEra[];
  collaborators: PerformanceCollaborator[];
  simpleCast?: { name: string; role: string }[];
  archiveMaterials?: ArchiveMaterial[];
  runningTime?: string;
  ticketPrice?: string;
  ticketing?: string;
  seating?: string;
  ageRestriction?: string;
  homeHero?: HomeHeroSettings;
};

const yangSeungHwanProfile = {
  id: 'yang-seung-hwan',
  name: '양승환',
  role: '사회',
  shortBio: 'KBS 국악대상 작곡상 수상. 국악방송 21C 한국음악프로젝트 예술감독 역임.',
  fullBio: ['KBS 국악대상 작곡상 수상', '국악방송 21C 한국음악프로젝트 예술감독 역임', '작곡집단 오선과한음 대표', '대구문화예술회관 국악인큐베이팅 사업 JUMP UP 음악감독', '영남대학교 겸임교수', '한국예술종합대학교 전통예술원 출강'],
} satisfies Omit<PerformanceCollaborator, 'image' | 'participatingWorks'>;

const collaborators: PerformanceCollaborator[] = [
  {
    id: 'yoon-seung-hwan',
    name: '윤승환',
    role: '장구·타악',
    image: 'assets/people/yoon-seung-hwan/portrait.jpg',
    shortBio: '부산대학교 한국음악학과 및 동 대학원 졸업. 국립부산국악원 기악단 부수석.',
    fullBio: ['부산대학교 한국음악학과 및 동 대학원 졸업', '한양대학교 음악연주학 박사(D.M.A.)', '서울시 무형유산 제25호 판소리고법 이수자', '국립부산국악원 기악단 부수석'],
    participatingWorks: ['해금과 장구를 위한 소곡', '춤사리기', '소리 Sori'],
  },
  {
    id: 'jin-min-jin',
    name: '진민진',
    role: '아쟁',
    image: 'assets/people/jin-min-jin/portrait.jpg',
    shortBio: '국립부산국악원 기악단 아쟁 단원. 부산대학교 한국음악학 박사(Ph.D.).',
    fullBio: ['국립부산국악원 기악단 아쟁 단원', '국가무형유산 종묘제례악 이수자', '부산광역시무형유산 아쟁산조 이수자', '부산대학교 한국음악학 박사(Ph.D.)'],
    participatingWorks: ['소리 Sori'],
  },
  {
    id: 'eo-yoon-seok',
    name: '어윤석',
    role: '25현가야금',
    image: 'assets/people/eo-yoon-seok/portrait.jpg',
    shortBio: '제24회 구례전국가야금경연대회 대통령상. 부산시립국악관현악단 상임단원.',
    fullBio: ['한양대학교 졸업 및 동 대학원 재학', '제24회 구례전국가야금경연대회 대통령상', '부산시립국악관현악단 상임단원'],
    participatingWorks: ['활의 노래'],
  },
  {
    ...yangSeungHwanProfile,
    image: 'assets/people/yang-seung-hwan/portrait.jpg',
    participatingWorks: ['해금, 시대를 잇다'],
  },
];

export const performances: Performance[] = [
  {
    id: 'haegeum-jeongak-2026-09-22',
    title: '풀고, 엮다',
    subtitle: '조윤경의 해금정악 - 해금상령산풀이·관악영산회상',
    date: '2026-09-22',
    displayDate: '2026. 9. 22. (화) 19:30',
    venue: '국립부산국악원 예지당',
    venueAddress: '부산광역시 부산진구 국악로 2',
    performer: '조윤경',
    featured: false,
    heroImage: 'assets/performances/haegeum-jeongak-2026-09-22/web/home-hero-desktop.png',
    heroImageMobile: 'assets/performances/haegeum-jeongak-2026-09-22/web/home-hero-mobile.png',
    homeHero: { theme: 'haegeum-jeongak' },
    archiveLabel: 'HAEGEUM JEONGAK',
    listDescription: '해금상령산풀이·관악영산회상',
    ticketPrice: '전석 초대석',
    seating: '지정석',
    ageRestriction: '미취학 아동 입장 불가',
    introduction: [],
    artistNote: [
      '정악은 오랜 세월 우리 음악의 정신과 미학을 담아 전승되어 온 음악입니다. 여러 악기가 서로의 소리를 존중하며 하나의 울림을 이루는 과정에는 절제와 균형, 긴 호흡이 빚어내는 깊은 아름다움이 있습니다.',
      '저는 오랫동안 정악을 연주하며 익숙한 음악을 새로운 시선으로 바라보고자 했습니다. 풍성한 합주의 아름다움도 소중하지만, 그 안에서 각 악기가 들려주는 선율과 호흡에 더욱 귀 기울이고 싶었습니다.',
      '이번 무대에서는 피리·대금·해금·장구 편성으로 관악영산회상 전바탕을 연주합니다. 삼현육각의 풍성한 음향에서 악기 수를 덜어내고, 피리와 대금, 해금이 각자의 음색과 선율을 드러내면서 서로의 가락을 주고받는 과정에 집중했습니다. 악기를 덜어낸 자리에 생긴 여백과 세 악기의 유기적인 호흡을 통해 관악영산회상의 또 다른 울림을 전하고자 합니다.',
      '이어지는 「해금 상령산풀이」는 정악의 선율을 독주자의 시선으로 다시 바라본 작업입니다. 2020년 독주회에서는 피리의 상령산풀이 가락을 해금으로 연주하며 두 악기의 선율적 가능성을 살펴보았습니다. 이번에는 해금 고유의 가락에 주목했습니다. 관악영산회상 상령산의 해금 선율을 바탕으로, 합주 안에서 이어져 온 가락을 해금 한 대의 호흡으로 풀어내고자 합니다.',
      '합주 속에서 서로의 소리를 듣고 호흡하는 일과, 그 안의 한 선율을 꺼내 홀로 마주하는 일은 서로 달라 보이지만 결국 같은 음악을 깊이 들여다보는 과정이라고 생각합니다. 이번 무대에서 익숙한 정악의 선율 속에 담긴 각 악기의 소리와 호흡, 그리고 그 사이의 여백을 함께 느껴주시기 바랍니다.',
    ],
    artistSignature: '조윤경',
    programEras: [
      { roman: '01', title: '관악영산회상(管樂靈山會相)', description: '상령산 · 중령산 · 세령산 · 가락덜이 · 삼현도드리 · 염불도드리 · 타령 · 군악', works: [{ number: 1, composer: '', composerYears: '', title: '관악영산회상', year: 'PROGRAM 01', instrumentation: ['피리 · 김성준', '대금 · 허유진', '해금 · 조윤경', '장구 · 윤승환'], composerNote: '관악영산회상은 영산회상 계열의 대표적인 정악으로, 표정만방지곡(表正萬方之曲)이라고도 한다. 본래 삼현육각 편성으로 연주되는 기악 모음곡으로, 관악기의 음색과 장단의 조화를 바탕으로 한국 전통 기악음악의 높은 예술성과 완성도를 보여주는 대표적인 레퍼토리이다.', workNote: '이번 연주에서는 상령산, 중령산, 세령산, 가락덜이, 삼현도드리, 염불도드리, 타령, 군악으로 이어지는 관악영산회상 전바탕을 선보인다. 각 악장은 장단과 선율의 점진적인 변화를 통해 서로 다른 음악적 성격을 드러내며, 느림에서 빠름으로 이어지는 자연스러운 흐름 속에서 정악 특유의 질서와 균형미를 완성한다.\n\n관악영산회상은 여러 악기가 서로 다른 역할을 수행하며 하나의 음악을 만들어가는 합주의 미학을 바탕으로 한다. 이번 무대에서는 피리·대금·해금·장구의 편성으로 관악영산회상을 새롭게 조명하고자 한다. 삼현육각의 풍성한 편성에서 악기의 수를 덜어내고, 피리와 대금, 해금이 각자의 음색과 선율을 더욱 선명하게 드러내면서도 서로의 가락을 주고받으며 하나의 흐름을 만들어가도록 구성하였다.\n\n피리는 선율의 중심을 이끌며 음악의 골격을 형성하고, 대금은 넓고 깊은 음색으로 선율의 공간을 확장한다. 해금은 두 관악기의 선율 사이를 오가며 가락의 결을 섬세하게 드러내고, 때로는 독립적인 선율로 응답하며 음악에 유연한 긴장과 생동감을 더한다. 장구는 절제된 장단으로 네 악기의 흐름을 안정감 있게 이끌며, 선율과 장단이 이루는 균형을 더욱 돋보이게 한다.\n\n이번 연주는 관악영산회상의 선율을 피리·대금·해금·장구라는 간결한 편성 안에서 새롭게 바라보고자 하는 시도이다. 악기를 덜어낸 자리에서 각 악기의 음색과 호흡, 선율 사이의 여백이 더욱 또렷하게 드러나며, 네 악기가 서로의 소리를 듣고 응답하는 과정 속에서 정악 특유의 깊이 있는 음악적 아름다움을 새로운 청각적 시선으로 경험할 수 있을 것이다.' }] },
      { roman: '02', title: '해금 상령산풀이', description: '', works: [{ number: 2, composer: '', composerYears: '', title: '해금 상령산풀이', year: 'PROGRAM 02', instrumentation: ['해금 · 조윤경'], composerNote: '상령산은 평조회상(유초신지곡)의 첫 악장으로, 정악의 절제된 아름다움과 깊은 호흡을 가장 잘 보여주는 대표적인 악곡이다. 유장하게 이어지는 선율은 화려한 기교보다 한 음 한 음에 담긴 여백과 균형을 중시하며, 정악이 지닌 정신성과 음악적 품격을 오롯이 담아낸다.', workNote: '상령산을 바탕으로 한 독주곡 〈상령산풀이〉는 대금 명인 김계선에 의해 독주곡으로 정립되었으며, 이후 피리 명인 정재국에 의해 피리 독주곡으로도 전승되어 왔다. 정악의 선율을 하나의 악기로 풀어내며, 악기 고유의 음색과 연주자의 호흡을 통해 상령산의 새로운 음악적 가능성을 보여주는 작품으로 자리하고 있다.\n\n이번 무대의 〈해금 상령산풀이〉는 이러한 독주곡의 전통에서 출발하되, 상령산의 해금 가락을 풀어보고자 하는 생각에서 시작되었다. 기존의 독주곡을 해금으로 옮겨 연주하는 데 머무르지 않고, 상령산이 지닌 선율과 음악적 정신을 바탕으로 해금의 음색과 시김새, 호흡에 어울리는 독주 가락을 새롭게 구성하였다.\n\n정악은 여러 악기가 함께 어우러져 하나의 음악을 완성하지만, 해금 상령산풀이는 해금이라는 하나의 악기를 통해 상령산의 또 다른 모습을 들여다보고자 하는 작업이다. 익숙한 상령산의 선율 속에서 해금만의 언어를 풀어내고자 한 이번 연주는, 전통의 본질을 존중하면서도 해금이라는 악기가 지닌 깊이와 표현 가능성을 새롭게 모색하는 하나의 음악적 시도라 할 수 있다.' }] },
    ],
    collaborators: [],
    simpleCast: [{ role: '해금', name: '조윤경' }, { role: '피리', name: '김성준' }, { role: '대금', name: '허유진' }, { role: '장구', name: '윤승환' }],
    archiveMaterials: [
      { label: 'POSTER', viewLabel: 'VIEW POSTER', previewImages: [{ src: 'assets/performances/haegeum-jeongak-2026-09-22/viewer/poster.png', alt: '풀고, 엮다 공연 포스터' }], downloadUrl: 'assets/performances/haegeum-jeongak-2026-09-22/downloads/poster.pdf', downloadLabel: 'DOWNLOAD PDF' },
      { label: 'LEAFLET', viewLabel: 'VIEW LEAFLET', previewImages: [{ src: 'assets/performances/haegeum-jeongak-2026-09-22/viewer/leaflet-outer.png', alt: '풀고, 엮다 리플렛 바깥면', label: 'OUTER' }, { src: 'assets/performances/haegeum-jeongak-2026-09-22/viewer/leaflet-inner.png', alt: '풀고, 엮다 리플렛 안쪽면', label: 'INNER' }], downloadUrl: 'assets/performances/haegeum-jeongak-2026-09-22/downloads/leaflet.pdf', downloadLabel: 'DOWNLOAD PDF' },
    ],
  },
  {
    id: 'sanjo-gil-2026-08-16',
    title: '산조길, 둘',
    subtitle: '한범수류 해금산조',
    date: '2026-08-16',
    displayDate: '2026. 8. 16. (일) 15:30',
    venue: '해운대문화회관 고운홀',
    venueAddress: '부산광역시 해운대구 양운로 97',
    venueUrl: 'https://www.haeundae.go.kr/culture/index.do',
    performer: '조윤경',
    featured: false,
    heroImage: 'assets/performances/sanjo-gil-2026-08-16/web/home-hero-desktop.png',
    runningTime: '약 60분 · 인터미션 없음',
    ticketPrice: '전석 10,000원',
    ticketing: '현장 발권',
    seating: '전석 자유석',
    ageRestriction: '미취학 아동 관람 불가',
    homeHero: { theme: 'sanjo-matiere' },
    archiveLabel: 'SANJO-GIL PROJECT 02',
    listDescription: '한범수류 해금산조의 길을 잇다',
    introduction: [],
    artistNoteLeadLines: [
      '산조는 한 사람의 음악이자,',
      '한 시대의 음악이며,',
      '수많은 예인들의 삶과 예술이 이어져 온',
      '우리 음악의 소중한 유산입니다.',
    ],
    artistNote: [
      '산조길 프로젝트의 두 번째 무대는 한범수류 해금산조를 중심에 두고, 그 음악이 품고 있는 시간의 결을 오늘의 연주로 다시 마주하고자 합니다.',
      '한범수류 해금산조는 절제된 선율 속에서도 깊은 감정의 흐름을 지니며, 장단의 변화와 함께 해금 특유의 음색이 섬세하게 드러나는 작품입니다.',
      '이번 공연에서는 산조에 앞서 남도 음악의 정서를 담은 육자배기와 흥타령을 함께 연주하며, 노래와 기악, 장단이 이어 온 음악적 호흡을 관객 여러분과 나누고자 합니다.',
      '전통은 고정된 과거가 아니라, 오늘의 몸과 마음을 통해 다시 살아나는 현재의 예술입니다. 이 무대가 산조의 깊이를 가까이 느끼고, 우리 음악이 이어 온 길을 함께 걸어보는 시간이 되기를 바랍니다.',
      '귀한 걸음으로 함께해 주신 모든 분들께 진심으로 감사드립니다.',
    ],
    artistSignature: '조윤경',
    programEras: [
      { roman: 'Ⅰ', title: '육자배기 · 흥타령', description: '남도 민요의 정서와 장단의 흐름을 해금, 가야금, 장구의 호흡으로 엮어 내는 무대', works: [
        { number: 1, composer: '전통음악', composerYears: '', title: '육자배기 · 흥타령', year: 'PROGRAM 01', instrumentation: ['해금 · 조윤경', '가야금 · 김나영', '장구 · 이영섭'], composerNote: '육자배기와 흥타령은 남도 음악 특유의 짙은 성음과 정서를 담고 있는 대표적인 민요이다.', workNote: '육자배기는 깊고 구성진 선율을 통해 한과 흥이 교차하는 남도 음악의 정서를 드러내며, 흥타령은 보다 유연하고 생동감 있는 장단의 흐름 속에서 노래의 흥취를 이어 간다. 이번 무대에서는 해금, 가야금, 장구의 편성으로 두 곡이 지닌 선율의 결, 장단의 호흡, 악기 간의 응답을 섬세하게 살려 전통 성음의 깊이와 실내악적 울림을 함께 전한다.' },
      ] },
      { roman: 'Ⅱ', title: '한범수류 해금산조', description: '진양조 — 중모리 — 중중모리 — 자진모리', works: [
        { number: 2, composer: '한범수', composerYears: '1911–1984', title: '한범수류 해금산조', year: 'PROGRAM 02', instrumentation: ['해금 · 조윤경', '장구 · 이영섭'], composerNote: '한범수는 대금, 피리, 해금 등 여러 관악기에 능했던 명인으로, 해금산조의 전승과 정립에 중요한 발자취를 남겼다.', workNote: '한범수류 해금산조는 담백하면서도 힘 있는 선율, 분명한 장단 구성, 해금의 농현과 시김새가 조화를 이루는 산조이다. 진양조의 느리고 깊은 호흡에서 시작해 중모리, 중중모리, 자진모리로 이어지며 점차 긴장과 속도를 더하고, 절제된 표현 속에 내면의 정서를 응축한다. 해금과 장구가 주고받는 긴밀한 호흡은 산조가 지닌 즉흥성과 형식미를 동시에 드러내며, 한 명인의 음악 세계가 오늘의 연주 안에서 새롭게 이어지는 순간을 만든다.' },
      ] },
    ],
    collaborators: [
      { id: 'lee-young-seop', name: '이영섭', role: '장구', image: 'assets/people/lee-young-seop/portrait.jpg', shortBio: '영남대학교 예술대학 국악전공 교수. World Music Group Vinalog 대표.', fullBio: ['영남대학교 예술대학 국악전공 교수', 'World Music Group ‘Vinalog’ 대표', '전통창작음악집단 ‘4인놀이’ 동인'], participatingWorks: ['육자배기 · 흥타령', '한범수류 해금산조'] },
      { id: 'kim-na-young', name: '김나영', role: '가야금', image: 'assets/people/kim-na-young/portrait.jpg', shortBio: '국가무형유산 가야금산조 및 병창 이수자. 국가유산진흥원 예술단.', fullBio: ['국가무형유산 가야금산조 및 병창 이수자', '국가유산진흥원 예술단', '제10회 의정부 죽파 가야금 경연대회 일반부 대상(국회의장상)', '제3회 영암 김창조 전국 국악대전 일반부 대상'], participatingWorks: ['육자배기 · 흥타령'] },
      { ...yangSeungHwanProfile, image: 'assets/people/yang-seung-hwan/portrait.jpg', participatingWorks: ['산조길, 둘'] },
    ],
    archiveMaterials: [
      { label: 'POSTER', viewLabel: 'VIEW POSTER', previewImages: [{ src: 'assets/performances/sanjo-gil-2026-08-16/viewer/poster.png', alt: '산조길, 둘 공연 포스터' }], downloadUrl: 'assets/performances/sanjo-gil-2026-08-16/downloads/poster.pdf', downloadLabel: 'DOWNLOAD PDF' },
      { label: 'LEAFLET', viewLabel: 'VIEW LEAFLET', previewImages: [{ src: 'assets/performances/sanjo-gil-2026-08-16/viewer/leaflet-outer.png', alt: '산조길, 둘 리플렛 바깥면', label: 'OUTER' }, { src: 'assets/performances/sanjo-gil-2026-08-16/viewer/leaflet-inner.png', alt: '산조길, 둘 리플렛 안쪽면', label: 'INNER' }], downloadUrl: 'assets/performances/sanjo-gil-2026-08-16/downloads/leaflet.pdf', downloadLabel: 'DOWNLOAD PDF' },
    ],
  },
  {
    id: 'haegeum-2026-08-02',
    title: '해금, 시대를 잇다',
    subtitle: '해금 창작곡의 변천',
    date: '2026-08-02',
    displayDate: '2026. 8. 2. (일) 16:00',
    venue: '향사아트센터',
    venueAddress: '경북 칠곡군 석적읍 강변대로 1570 향사아트센터',
    venueUrl: 'https://www.chilgokctf.or.kr/ctf/main.do',
    performer: '조윤경',
    featured: true,
    heroImage: 'assets/performances/haegeum-2026-08-02/web/home-hero-desktop.png',
    homeHero: { theme: 'haegeum-recital' },
    archiveLabel: 'HAEGEUM RECITAL 2026',
    listDescription: '해금 창작곡의 변천을 기록하다',
    introduction: [
      '창작국악은 전통음악의 계승에 머무르지 않고 시대의 변화와 새로운 예술적 요구를 반영하며 발전해 온 현대 국악의 중요한 흐름이다. 조선 말기 이후 서양음악의 유입과 근대적 음악 교육, 공연 문화의 변화는 국악에도 새로운 창작의 필요성을 제기하였고, 광복 이후에는 전통음악의 현대화를 위한 다양한 시도가 이어졌다.',
      '1950년대 후반부터 국악 창작에 대한 관심이 점차 확대되었으며, 1960년대에 들어서면서 독주곡, 실내악, 국악관현악 등 다양한 편성의 창작 작품이 본격적으로 발표되기 시작하였다. 작곡가들은 전통 장단과 선율, 시김새를 바탕으로 현대적인 음악 언어를 접목하며 새로운 국악의 가능성을 모색하였고, 이는 오늘날 창작국악의 토대가 되었다.',
      '특히 1966년 발표된 김흥교의 「해금과 장구를 위한 소곡」은 해금을 위한 최초의 본격적인 창작 독주곡으로 평가받으며, 이후 해금 창작음악 발전의 중요한 출발점이 되었다. 이를 계기로 해금은 전통 연주를 넘어 현대 창작음악의 독립적인 독주 악기로 자리매김하기 시작하였다.',
      '1970~1980년대에는 창작국악이 하나의 독립된 예술 영역으로 성장하였다. 전통적인 어법을 유지하면서도 현대적인 화성, 리듬, 형식을 적극적으로 수용한 작품들이 등장하였고, 해금·가야금·대금 등 국악기의 독주적 가능성을 탐구하는 다양한 레퍼토리가 축적되었다.',
      '1990년대 이후에는 현대음악 작곡기법, 전자음향, 타 장르와의 협업, 해외 작곡가들과의 교류가 활발해지면서 창작국악은 더욱 폭넓은 예술 세계로 확장되었다. 작곡가들은 국악기의 음색과 연주기법을 현대적인 감각으로 재해석하였으며, 연주자 역시 새로운 음악 언어를 구현하기 위한 다양한 표현 기법을 발전시켜 왔다.',
      '오늘날 창작국악은 전통과 현대, 동양과 서양, 과거와 미래를 잇는 예술로 자리하고 있다. 전통음악의 정체성을 바탕으로 새로운 음악 언어를 창조하는 창작국악은 끊임없는 실험과 변화를 통해 한국 음악의 현재를 보여주는 동시에 미래를 향해 나아가고 있다.',
      '이번 독주회 「해금, 시대를 잇다 ― 해금 창작곡의 변천」은 이러한 창작국악의 흐름 속에서 해금 창작 독주곡의 발자취를 시대별 대표 작품을 통해 조망하고자 한다. 1966년 김흥교의 「해금과 장구를 위한 소곡」에서 시작하여 김기수, 김영재, 이해식, 이정면, 그리고 도널드 리드 워맥의 작품에 이르기까지, 각 시대를 대표하는 작곡가들의 음악 세계를 따라가며 해금이 전통의 울림을 간직한 채 현대의 예술 언어로 확장되어 온 과정을 살펴보고자 한다. 이 무대가 해금 창작음악의 역사와 현재를 이해하고, 앞으로의 가능성을 함께 그려보는 뜻깊은 시간이 되기를 바란다.',
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
        { number: 1, composer: '김흥교', composerYears: '1918–1995', title: '해금과 장구를 위한 소곡', year: '1966', instrumentation: ['장구 · 윤승환'], composerNote: '김흥교는 국악 창작 초창기부터 활발한 작품 활동을 이어온 작곡가로, 전통음악의 어법을 바탕으로 해금을 비롯한 다양한 국악기의 현대적 가능성을 탐구하였다. 해금 독주곡의 초기 레퍼토리 형성에도 중요한 역할을 하였으며, 절제된 음악어법과 한국적인 정서를 바탕으로 한 작품들을 남겼다.', workNote: '「해금과 장구를 위한 소곡」은 해금과 장구라는 가장 기본적인 편성을 통해 해금의 섬세한 음색과 장단의 긴밀한 호흡을 보여주는 작품이다. 전통적인 선율 어법을 바탕으로 하면서도 현대적 작곡기법을 절제하여 사용함으로써 창작 해금음악의 초기 모습을 잘 보여준다. 이번 공연에서는 해금 창작 독주곡의 출발점을 상징하는 작품으로 자리한다.' },
        { number: 2, composer: '김기수', composerYears: '1917–1986', title: '등롱', year: '1978', composerNote: '김기수는 국악의 현대화를 이끈 대표적인 작곡가이자 교육자로, 전통음악의 미학을 바탕으로 새로운 국악 창작의 방향을 제시하였다. 그의 작품은 한국적 선율과 리듬을 현대적인 감각으로 재구성한 것이 특징이다.', workNote: '「등롱」은 은은한 등불이 어둠을 밝히듯 서정적이고 깊이 있는 정서를 담아낸 작품이다. 해금 특유의 유연한 음색을 중심으로 섬세한 감정의 흐름을 표현하며, 전통과 현대의 균형 속에서 창작음악의 새로운 가능성을 보여준다.' },
      ] },
      { roman: 'Ⅱ', title: '해금의 확장', description: '1980–90년대 연주 기법과 장단, 춤의 호흡으로 넓어진 해금의 표현 세계', works: [
        { number: 3, composer: '김영재', composerYears: '1947–', title: '적념', year: '1989', composerNote: '김영재는 해금 연주자이자 작곡가로서 연주자의 경험을 바탕으로 해금의 표현 영역을 꾸준히 확장해 왔다. 전통음악에 대한 깊은 이해와 현대적 감각을 바탕으로 다수의 해금 작품을 발표하며 창작 해금음악 발전에 기여하였다.', workNote: '「적념」은 ‘쌓인 생각’이라는 제목처럼 내면의 깊은 사색과 감정을 음악으로 풀어낸 작품이다. 폭넓은 음역과 섬세한 활의 움직임을 통해 해금만이 표현할 수 있는 농밀한 정서를 담아내며, 창작 해금음악이 한층 성숙한 예술적 깊이에 이르렀음을 보여준다.' },
        { number: 4, composer: '이해식', composerYears: '1943–2010', title: '춤사리기', year: '1999', instrumentation: ['장구 · 윤승환'], composerNote: '이해식은 전통 장단과 현대적 작곡기법을 접목하여 한국 창작음악의 새로운 지평을 개척한 작곡가이다. 다양한 국악 창작 작품을 통해 한국적 리듬의 현대적 가능성을 지속적으로 탐구해 왔다.', workNote: '「춤사리기」는 한국 춤의 움직임과 호흡을 음악으로 형상화한 작품이다. 역동적인 장단과 유려한 선율이 어우러지며 해금의 리듬감과 표현력을 극대화한다. 즉흥성과 생동감이 공존하는 이 작품은 해금 창작곡의 표현 영역이 더욱 다양해졌음을 보여준다.' },
      ] },
      { roman: 'Ⅲ', title: '새로운 시대를 향하여', description: '2000년대 이후 확장된 음향, 현대적 연주법, 세계 음악 언어와의 만남', works: [
        { number: 5, composer: '이정면', composerYears: '1969–', title: '활의 노래', year: '2009', instrumentation: ['25현가야금 · 어윤석'], composerNote: '이정면은 현대적 음악어법과 국악기의 특성을 조화롭게 결합하는 작곡가로, 해금의 새로운 연주기법과 음향 가능성을 적극적으로 탐구해 왔다.', workNote: '「활의 노래」는 제목 그대로 활의 움직임 자체를 음악의 중심 요소로 삼는다. 다양한 활쓰기와 음색 변화, 현대적인 연주기법을 통해 해금의 새로운 음향 세계를 펼쳐 보이며, 오늘날 창작 해금음악이 지향하는 확장성과 실험성을 상징하는 작품이다.' },
        { number: 6, composer: 'Donald Reid Womack', composerYears: '1970–', title: '소리 Sori', year: '2014', instrumentation: ['아쟁 · 진민진', '타악 · 윤승환'], composerNote: '도널드 리드 워맥은 미국 출신의 작곡가로, 한국 전통음악과 국악기에 깊은 관심을 가지고 다양한 작품을 발표하였다. 한국의 음악적 정서를 현대적 작곡기법과 접목하며 국내외에서 활발한 활동을 이어가고 있다.', workNote: '「소리」는 해금의 음색과 호흡, 그리고 미세한 음의 움직임을 현대적인 시각에서 새롭게 조명한 작품이다. 국적과 문화의 경계를 넘어 해금을 하나의 세계적인 현대악기로 바라보며, 전통과 현대, 동양과 서양이 음악 안에서 자연스럽게 만나는 가능성을 제시한다. 본 공연의 마지막을 장식하는 이 작품은 해금 창작음악이 시대를 넘어 세계와 소통하는 현재를 상징적으로 보여준다. 본 곡은 해금, 첼로, 타악으로 편성되었으나 오늘 연주는 해금, 아쟁, 타악으로 재편성하였다.' },
      ] },
    ],
    collaborators,
    archiveMaterials: [
      {
        label: 'POSTER',
        viewLabel: 'VIEW POSTER',
        previewImages: [{ src: 'assets/performances/haegeum-2026-08-02/viewer/poster.png', alt: '해금, 시대를 잇다 공연 포스터' }],
        downloadUrl: 'assets/performances/haegeum-2026-08-02/downloads/poster.pdf',
        downloadLabel: 'DOWNLOAD PDF',
      },
      {
        label: 'LEAFLET',
        viewLabel: 'VIEW LEAFLET',
        previewImages: [{ src: 'assets/performances/haegeum-2026-08-02/viewer/leaflet-outer.png', alt: '해금, 시대를 잇다 리플렛 바깥면', label: 'OUTER' }, { src: 'assets/performances/haegeum-2026-08-02/viewer/leaflet-inner.png', alt: '해금, 시대를 잇다 리플렛 안쪽면', label: 'INNER' }],
        downloadUrl: 'assets/performances/haegeum-2026-08-02/downloads/leaflet.pdf',
        downloadLabel: 'DOWNLOAD PDF',
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

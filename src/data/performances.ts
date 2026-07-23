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
  viewUrl?: string;
  downloadUrl?: string;
  previewImageUrl?: string;
  viewLabel: string;
  downloadLabel?: string;
};

export type LeafletPreviewImage = {
  src: string;
  alt: string;
  label: string;
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
  leafletPreviewImages?: LeafletPreviewImage[];
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
    fullBio: ['KBS 국악대상 작곡상 수상', '국악방송 21C 한국음악프로젝트 예술감독 역임', '작곡집단 오선과한음 대표', '대구문화예술회관 국악인큐베이팅 사업 JUMP UP 음악감독', '영남대학교 겸임교수', '한국예술종합대학교 전통예술원 출강'],
    participatingWorks: ['해금, 시대를 잇다'],
  },
];

export const performances: Performance[] = [
  {
    id: 'sanjo-gil-2026-08-16',
    title: '산조길, 둘',
    subtitle: '한범수류 해금산조',
    date: '2026-08-16',
    displayDate: '2026. 8. 16. (일) 15:30',
    venue: '해운대문화회관 고운홀',
    venueAddress: '부산광역시 해운대구 양운로 97 해운대문화회관',
    venueUrl: 'https://www.haeundae.go.kr/culture/index.do',
    performer: '조윤경',
    featured: false,
    heroImage: 'images/hero/sanjo-gil-02/hero-background.png',
    archiveLabel: 'SANJO-GIL PROJECT 02',
    listDescription: '한범수류 해금산조의 길을 잇다',
    introduction: [],
    artistNote: [
      '산조는 한 사람의 음악이자, 한 시대의 음악이며, 수많은 예인들의 삶과 예술이 이어져 온 우리 음악의 소중한 유산입니다.',
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
      { id: 'lee-young-seop', name: '이영섭', role: '장구', image: 'images/performers/lee-young-seop.jpg', shortBio: '영남대학교 예술대학 국악전공 교수. World Music Group Vinalog 대표.', fullBio: ['영남대학교 예술대학 국악전공 교수', 'World Music Group ‘Vinalog’ 대표', '전통창작음악집단 ‘4인놀이’ 동인'], participatingWorks: ['육자배기 · 흥타령', '한범수류 해금산조'] },
      { id: 'kim-na-young', name: '김나영', role: '가야금', image: 'images/performers/kim-na-young.jpg', shortBio: '국가무형유산 가야금산조 및 병창 이수자. 국가유산진흥원 예술단.', fullBio: ['국가무형유산 가야금산조 및 병창 이수자', '국가유산진흥원 예술단', '제10회 의정부 죽파 가야금 경연대회 일반부 대상', '제3회 영암 김창조 전국 국악대악대전 일반부 대상'], participatingWorks: ['육자배기 · 흥타령'] },
    ],
    archiveMaterials: [
      { label: 'POSTER', viewLabel: 'POSTER' },
      { label: 'LEAFLET', viewLabel: 'LEAFLET' },
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
    heroImage: 'images/hero/hero-background-v2.png',
    posterPreviewImageUrl: 'images/archive/2026-08-02-poster.png',
    leafletPreviewImages: [
      {
        src: 'images/archive/2026-08-02-leaflet-outer.png',
        alt: '해금, 시대를 잇다 리플렛 바깥면',
        label: 'OUTER',
      },
      {
        src: 'images/archive/2026-08-02-leaflet-inner.png',
        alt: '해금, 시대를 잇다 리플렛 안쪽면',
        label: 'INNER',
      },
    ],
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
        viewUrl: 'images/archive/2026-08-02-poster.png',
        downloadUrl: 'images/archive/2026-08-02-poster.png',
        downloadLabel: 'DOWNLOAD PNG',
      },
      {
        label: 'LEAFLET',
        viewLabel: 'VIEW LEAFLET',
        viewUrl: 'files/2026-08-02-leaflet.pdf',
        downloadUrl: 'files/2026-08-02-leaflet.pdf',
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

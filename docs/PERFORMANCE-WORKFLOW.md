# 공연 등록 워크플로

- 마지막 확인 날짜: 2026-07-24
- 기준 commit SHA: `8a574e10b82f`

## A. 사용자에게 먼저 받아야 할 자료

- 최종 공연 원고, 제목·부제, 날짜·시간
- 장소·주소·공식 홈페이지
- 러닝타임, 티켓 가격·발권 방식·좌석·관람 연령
- 연주자의 말, 프로그램 순서와 해설
- 출연자·사회자 이름, 역할, 약력, 사진
- 포스터·리플렛, Viewer용 이미지, 다운로드용 PDF
- 문의 정보, 공연별 디자인 방향
- 데스크톱·모바일 배경 이미지

## B. 원고 검수

1. 이름, 곡명, 유파명, 약력, 대회명, 수상명, 날짜, 장소를 원본 문서와 대조합니다.
2. 원본 문서를 Source of Truth로 사용합니다.
3. 문구를 임의로 다시 쓰지 않습니다.
4. 웹용 축약이 필요하면 사용자 승인 후 진행합니다.
5. 원문과 웹 문장이 다르면 그 이유를 PR 또는 작업 메모에 기록합니다.
6. 오타 수정도 원본과 공식 명칭을 다시 확인한 뒤 반영합니다.

## C. 공연 ID와 폴더 생성 규칙

권장 ID 형식은 `{slug}-{YYYY-MM-DD}`입니다.

```txt
sanjo-gil-2026-08-16
haegeum-2026-08-02
```

권장 폴더 구조입니다.

```txt
public/images/performance/{YYYY-MM-DD}/
  home/
  detail/
  archive/
  performers/
```

권장 파일명 표준입니다.

```txt
home/hero-background.png
detail/hero-background.png
detail/hero-background-mobile.png
detail/note-info-background.png
detail/note-info-background-mobile.png
detail/program-01-background.png
detail/program-02-background.png
detail/program-02-background-mobile.png
detail/guest-artists-background.png
detail/archive-bottom-background.png
archive/{date}-poster.png
archive/{date}-poster.pdf
archive/{date}-leaflet-outer.png
archive/{date}-leaflet-inner.png
archive/{date}-leaflet.pdf
performers/{person-id}.jpg
```

## D. 업로드 순서

1. 사용자가 바이너리 파일을 GitHub에 직접 업로드합니다.
2. 실제 경로와 파일명을 확인합니다.
3. Codex는 `src/data/performances.ts`와 CSS에서 경로만 연결합니다.
4. PR에서 바이너리 변경 여부를 확인합니다.
5. Viewer, 다운로드, 모바일 배경을 실제 화면에서 확인합니다.

## E. `performances.ts` 입력 항목

| 필드 | 용도 | 예시 |
| --- | --- | --- |
| `id` | 라우팅과 데이터 식별자 | `sanjo-gil-2026-08-16` |
| `title` | 공연 제목 | `산조길, 둘` |
| `subtitle` | 부제 | `한범수류 해금산조` |
| `date` | 정렬용 ISO 날짜 | `2026-08-16` |
| `displayDate` | 화면 표시 날짜·시간 | `2026. 8. 16. (일) 15:30` |
| `venue` | 장소명 | `해운대문화회관 고운홀` |
| `venueAddress` | 주소 | `부산광역시 해운대구 양운로 97` |
| `venueUrl` | 공식 장소 링크 | `https://www.haeundae.go.kr/culture/index.do` |
| `performer` | 대표 연주자 | `조윤경` |
| `runningTime` | 러닝타임 | `약 60분 · 인터미션 없음` |
| `ticketPrice` | 티켓 가격 | `전석 10,000원` |
| `ticketing` | 발권 방식 | `현장 발권` |
| `seating` | 좌석 방식 | `전석 자유석` |
| `ageRestriction` | 관람 연령 | `미취학 아동 관람 불가` |
| `archiveLabel` | 아카이브 라벨 | `SANJO-GIL PROJECT 02` |
| `listDescription` | 목록 설명 | `한범수류 해금산조의 길을 잇다` |
| `artistNoteLeadLines` | 연주자의 말 강조 행 | `['산조는 한 사람의 음악이자,']` |
| `artistNote` | 연주자의 말 본문 | `['산조길 프로젝트의 두 번째 무대는...']` |
| `artistSignature` | 서명 | `조윤경` |
| `programEras` | 프로그램 섹션과 작품 해설 | `[{ roman: 'Ⅰ', title: '육자배기 · 흥타령', works: [...] }]` |
| `collaborators` | 출연자·사회자 카드 | `[{ id: 'lee-young-seop', name: '이영섭', ... }]` |
| `archiveMaterials` | Viewer PNG와 다운로드 PDF | `POSTER`, `LEAFLET` |
| `homeHero` | 홈 히어로 테마 | `{ theme: 'sanjo-matiere' }` |

## F. 출연자·사회자

- 공통 프로필은 재사용 가능합니다.
- 공연별 `image`와 `participatingWorks`는 따로 지정할 수 있습니다.
- 존재하지 않는 약력은 생성하지 않습니다.
- 카드 수에 따라 PC·태블릿·모바일 열 수가 자연스럽게 변경되어야 합니다.
- 프로필 패널과 `VIEW PROFILE` 동작을 확인합니다.

## G. 디자인

- 모든 공연에 동일 디자인을 강제하지 않습니다.
- 공연별 테마 클래스 안에서 색상과 배경을 관리합니다.
- 기존 공연 디자인에 영향을 주지 않도록 범위를 제한합니다.
- 배경과 글자 대비를 확인합니다.
- 데스크톱·모바일 배경을 별도로 준비할 수 있습니다.
- 본문이 길어지면 `background-size: cover` 크롭이 달라질 수 있으므로 원고 확정 후 배경을 적용합니다.

## H. PR 흐름

논의 → 지시서 → Codex 작업 → PR 검토 → Actions 확인 → 직접 화면 확인 → 머지 → 배포 확인

## I. 두 공연에서 발생한 시행착오

- 바이너리 파일 복사 작업으로 오류가 발생했습니다.
- PR 설명만 믿지 않고 실제 변경 파일과 patch를 확인해야 합니다.
- 빌드 성공만으로 UI 정상 여부를 판단하지 않습니다.
- 모바일 Reveal에서 콘텐츠가 안 보이는 문제가 있었습니다.
- Archive Viewer가 헤더 아래에 표시된 문제가 있었습니다.
- 데스크톱 배경을 모바일에서 그대로 써서 크롭이 어색했던 문제가 있었습니다.
- 원문 전체 교체 시 섹션 높이와 배경 구도가 변할 수 있습니다.
- 이름과 약력 오타는 원본 및 공식 명칭과 대조해야 합니다.

검수는 [RELEASE-CHECKLIST.md](./RELEASE-CHECKLIST.md)를 사용하고, 파일 규격은 [ASSET-SPECIFICATIONS.md](./ASSET-SPECIFICATIONS.md)를 확인합니다.

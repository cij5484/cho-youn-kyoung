# 홈페이지 구조와 운영 원칙

- 코드 대조 날짜: 2026-08-31 (`41d082b`)
- 저장소: `cij5484/cho-youn-kyoung`

## 확정된 기술 구조

| 항목 | 확정 내용 |
| --- | --- |
| 프레임워크 | React + Vite + TypeScript |
| 앨범 3D | Three.js + React Three Fiber, 앨범별 persistent stage |
| 콘텐츠·음원 | TypeScript 정적 데이터, 앨범 트랙의 외부 R2 URL. 별도 앱 서버·DB·로그인 없음 |
| 라우터 | `HashRouter` |
| 배포 | GitHub Pages + GitHub Actions |
| Vite base | `vite.config.ts`의 `base: '/'` 유지 |
| 공식 도메인 | <https://choyounkyoung.com/> |
| 영문 이름 | CHO YOUN KYOUNG |

## 검색엔진 기본 파일

- `public/sitemap.xml`은 공식 도메인에서 실제로 수집 가능한 URL만 관리합니다.
- 현재 `HashRouter` 구조에서는 사이트맵에 공식 루트 주소만 포함합니다.
- `#` 이후 경로나 존재하지 않는 서버 경로는 사이트맵에 넣지 않습니다.
- `public/robots.txt`는 모든 검색엔진의 수집을 허용하고 사이트맵 위치를 제공합니다.

## 주요 경로

| 경로 | 역할 |
| --- | --- |
| `/` | HOME. 현재 대표 Work와 공연·앨범 확장이 가능한 RECENT WORKS를 보여준다. |
| `/works` | WORKS. 최신순 PERFORMANCES와 ALBUMS 아카이브를 함께 보여준다. |
| `/performance` | 기존 공연 목록 링크 호환을 위해 `/works`와 같은 WORKS 페이지를 보여준다. |
| `/performance/:id` | 공연 상세. 공연별 콘텐츠와 테마를 보여준다. |
| `/album/:id` | 공통 `AlbumDetailPage`가 `albums.ts`의 ID를 조회해 앨범 상세를 표시하며, 없는 ID는 공통 404를 표시한다. |
| `/media` | MEDIA. 공연 영상, 언론 보도와 특별한 음악 기록을 보여주며 앨범 DISCOGRAPHY는 중복 구성하지 않는다. |
| `/about` | ABOUT. 프로필과 공연 이력을 보여준다. 공연 이력은 오래된 순서 우선이다. |
| `/contact` | CONTACT. 공식 연락 채널을 보여준다. |
| 그 외 경로 | 404 안내와 HOME·WORKS 복귀 링크를 보여준다. |

## 데이터 파일

| 파일 | 용도 |
| --- | --- |
| `src/data/performances.ts` | 공연 목록, 상세 콘텐츠, 출연자, 아카이브 자료, 홈 히어로 테마 |
| `src/data/profile.ts` | 프로필, ABOUT 정보, 공연 이력 |
| `src/data/site.ts` | 사이트 공통 이름·연락·메타 정보 |
| `src/data/albums.ts` | 앨범 데이터 |
| `src/data/homeHeroSlides.ts` | 공연·앨범 Source of Truth를 변경하지 않고 HOME 노출 모델로 조합하는 adapter |
| `src/data/media.ts` | MEDIA의 공연 영상과 특별 기록 데이터 및 섹션 분류. 앨범 데이터는 저장하지 않는다. |
| `src/data/press.ts` | 검증된 언론 기사와 자동 최신순 정렬을 관리하는 PRESS Source of Truth. |

## 운영 원칙

- 공연 목록은 최신 공연 우선으로 정렬합니다.
- ABOUT 공연 이력은 오래된 순서 우선으로 정리합니다.
- 공연별 콘텐츠와 공연별 디자인 테마를 분리합니다.
- 공통 데이터와 공통 컴포넌트는 재사용하되, 공연 고유 디자인은 해당 공연 테마 클래스 안에서만 적용합니다.
- 기존 디자인을 수정할 때는 관련 CSS를 정리하고 임시 override를 추가하지 않습니다.
- 새 `!important`는 금지합니다.
- 사용자가 원본 자료를 제공하고, 홈페이지 문구는 원본과 먼저 대조합니다.
- 임의 인물, 약력, 문의처, 티켓 정보, QR 코드를 만들지 않습니다.
- 바이너리 파일은 사용자가 직접 업로드하고 Codex는 코드 연결만 담당합니다.
- 같은 인물 사진은 기존 경로를 재사용할 수 있습니다.
- HOME Hero는 자동 순환하지 않으며, 현재 대표 Work를 유지하고 사용자가 RECENT WORKS에서 다른 고유 Hero Scene을 선택합니다. 자세한 운영 원칙은 [HOME-HERO-WORKFLOW.md](./HOME-HERO-WORKFLOW.md)를 따릅니다.
- HOME의 `album-package` theme에는 지영희류·한범수류 두 앨범을 연결한다. `App.tsx`의 앨범별 persistent stage가 HOME과 상세 사이의 배경·Canvas를 유지하고, `AlbumHero`는 해당 stage 활성 상태와 정보·링크를 담당한다.
- 기본 Hero는 `homeHeroSlides.ts`의 `DEFAULT_HOME_HERO_ID`가 노출 목록에 있으면 날짜와 관계없이 우선한다. 현재 값은 `haegeum-jeongak-2026-09-22`다. 지정 ID가 없을 때만 서울 날짜 기준 가까운 예정 Work, 없으면 가장 최근 날짜의 Work, 날짜도 없으면 첫 항목 순으로 선택한다.
- HOME 앨범은 실제 cover, `detailsPath`, `albumHero`와 확정 발매일이 있을 때 노출한다. 발매일 미정 `coming-soon`은 확인된 연도가 있으면 노출할 수 있지만 날짜 기반 기본 Hero 후보에서는 제외하여 공연 선정 로직을 바꾸지 않는다.
- 두 앨범 모두 3D 상세, CD Player와 Digital Booklet이 구현되어 있고 각 6개 트랙의 `webAudioUrl`이 R2에 연결되어 있다. 북클릿은 지영희류 7페이지, 한범수류 11페이지다. 지영희류의 정확한 발매일·공식 플랫폼 링크와 두 앨범의 북클릿 PDF 다운로드 URL은 미등록 상태다. 코드 연결과 외부 재생 성공은 별도로 검증한다.
- 모바일 메뉴는 열린 뒤 첫 링크에 포커스하고, ESC·경로 변경 시 닫으며, 열려 있는 동안 배경 스크롤을 잠급니다. ESC 또는 메뉴 버튼으로 닫으면 메뉴 버튼에 포커스를 복원합니다.
- 내비게이션은 HOME → WORKS → MEDIA → ABOUT → CONTACT 순서입니다.
- WORKS는 `performances.ts`와 `albums.ts`를 각각 소비합니다. 앨범은 WORKS에서 관리하고 `albums.ts`를 Source of Truth로 유지하며, 공연 상세의 `/performance/:id` 공개 URL은 영구 유지합니다. 실제 자료가 준비된 앨범 상세는 공통 `/album/:id` 구조를 사용합니다. 목록의 `detailsPath`는 상세 연결을 공개할 앨범에만 설정합니다.
- WORKS 활성 상태는 `/works`, `/performance`, `/performance/:id`, `/album/:id`에 함께 적용합니다.
- 앨범과 공식 플랫폼 링크 및 앨범 상세용 웹 재생 정보는 `albums.ts`, 일반 MEDIA 영상·음원과 특별 기록은 `media.ts`, 언론 기사는 `press.ts`에서 관리하며 도메인 데이터를 중복하지 않습니다. 앨범의 HOME 노출 모델은 원본 데이터를 복사하지 않고 `homeHeroSlides.ts` adapter에서 조합합니다.
- Codex에게 이미지 복사, 재인코딩, 재압축을 시키지 않습니다.

## Archive Viewer 원칙

- Archive Viewer는 포스터·리플렛 WebP를 브라우저에서 크게 미리보기하는 기능입니다.
- Viewer는 헤더 아래가 아니라 화면 전체를 덮는 전체화면 레이어로 표시되어야 합니다.
- ESC, 키보드 포커스, 닫기 버튼, 모바일 스크롤을 확인합니다.
- 현재 공연·앨범의 웹/Viewer 이미지는 WebP를 사용하고, 등록된 다운로드는 별도 PDF를 사용합니다. 과거 PNG 실측표는 현재 경로 안내가 아닙니다.
- 리플렛 Viewer 표시 순서는 OUTER → INNER입니다.

## 실제 공연 사례

| 날짜 | 제목 | ID | 경로 | 테마 성격 | 주요 자료 구조 |
| --- | --- | --- | --- | --- | --- |
| 2026-08-02 | 해금, 시대를 잇다 | `haegeum-2026-08-02` | `/performance/haegeum-2026-08-02` | 해금 창작곡 변천을 기록하는 리사이틀형 테마 | `public/assets/performances/haegeum-2026-08-02/` |
| 2026-08-16 | 산조길, 둘 | `sanjo-gil-2026-08-16` | `/performance/sanjo-gil-2026-08-16` | 산조길 프로젝트의 마티에르형 공연 상세 테마 | `public/assets/performances/sanjo-gil-2026-08-16/` |
| 2026-09-22 | 풀고, 엮다 | `haegeum-jeongak-2026-09-22` | `/performance/haegeum-jeongak-2026-09-22` | 정악 전용 HOME·상세 테마 | `public/assets/performances/haegeum-jeongak-2026-09-22/` |

자세한 공연 등록 절차는 [PERFORMANCE-WORKFLOW.md](./PERFORMANCE-WORKFLOW.md), 파일 규격은 [ASSET-SPECIFICATIONS.md](./ASSET-SPECIFICATIONS.md)를 따릅니다.

# 홈페이지 구조와 운영 원칙

- 마지막 확인 날짜: 2026-08-13
- 작업 기준 main SHA: `13ff9af`
- 저장소: `cij5484/cho-youn-kyoung`

## 확정된 기술 구조

| 항목 | 확정 내용 |
| --- | --- |
| 프레임워크 | React + Vite + TypeScript |
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
- HOME에는 향후 앨범을 위한 별도 `album-package` Hero theme과 Three.js + React Three Fiber 디지팩 Scene 기반이 있다. 실제 앨범 slide와 texture는 아직 연결하지 않았고 기존 공연 Hero 및 RECENT WORKS 동작은 그대로 유지한다.
- 모바일 메뉴는 열린 뒤 첫 링크에 포커스하고, ESC·경로 변경 시 닫으며, 열려 있는 동안 배경 스크롤을 잠급니다. ESC 또는 메뉴 버튼으로 닫으면 메뉴 버튼에 포커스를 복원합니다.
- 내비게이션은 HOME → WORKS → MEDIA → ABOUT → CONTACT 순서입니다.
- WORKS는 `performances.ts`와 `albums.ts`를 각각 소비합니다. 앨범은 WORKS에서 관리하고 `albums.ts`를 Source of Truth로 유지하며, 공연 상세의 `/performance/:id` 공개 URL은 영구 유지합니다. 실제 자료가 준비된 앨범 상세는 공통 `/album/:id` 구조를 사용합니다. 목록의 `detailsPath`는 상세 연결을 공개할 앨범에만 설정합니다.
- WORKS 활성 상태는 `/works`, `/performance`, `/performance/:id`, `/album/:id`에 함께 적용합니다.
- 앨범과 공식 플랫폼 링크 및 앨범 상세용 웹 재생 정보는 `albums.ts`, 일반 MEDIA 영상·음원과 특별 기록은 `media.ts`, 언론 기사는 `press.ts`에서 관리하며 도메인 데이터를 중복하지 않습니다. 앨범의 HOME 노출 모델은 원본 데이터를 복사하지 않고 `homeHeroSlides.ts` adapter에서 조합합니다.
- Codex에게 이미지 복사, 재인코딩, 재압축을 시키지 않습니다.

## Archive Viewer 원칙

- Archive Viewer는 포스터·리플렛 PNG를 브라우저에서 크게 미리보기하는 기능입니다.
- Viewer는 헤더 아래가 아니라 화면 전체를 덮는 전체화면 레이어로 표시되어야 합니다.
- ESC, 키보드 포커스, 닫기 버튼, 모바일 스크롤을 확인합니다.
- 포스터·리플렛 미리보기는 PNG를 사용하고, 다운로드는 별도 PDF를 사용합니다.
- 리플렛 Viewer 표시 순서는 OUTER → INNER입니다.

## 실제 공연 사례

| 날짜 | 제목 | ID | 경로 | 테마 성격 | 주요 자료 구조 |
| --- | --- | --- | --- | --- | --- |
| 2026-08-02 | 해금, 시대를 잇다 | `haegeum-2026-08-02` | `/performance/haegeum-2026-08-02` | 해금 창작곡 변천을 기록하는 리사이틀형 테마 | `public/assets/performances/haegeum-2026-08-02/` |
| 2026-08-16 | 산조길, 둘 | `sanjo-gil-2026-08-16` | `/performance/sanjo-gil-2026-08-16` | 산조길 프로젝트의 마티에르형 공연 상세 테마 | `public/assets/performances/sanjo-gil-2026-08-16/` |

자세한 공연 등록 절차는 [PERFORMANCE-WORKFLOW.md](./PERFORMANCE-WORKFLOW.md), 파일 규격은 [ASSET-SPECIFICATIONS.md](./ASSET-SPECIFICATIONS.md)를 따릅니다.

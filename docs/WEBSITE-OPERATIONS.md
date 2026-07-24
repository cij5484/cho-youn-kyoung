# 홈페이지 구조와 운영 원칙

- 마지막 확인 날짜: 2026-07-24
- 기준 commit SHA: `8a574e10b82f`
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

## 주요 경로

| 경로 | 역할 |
| --- | --- |
| `/` | HOME. 대표 공연과 홈 히어로를 보여준다. |
| `/performance` | PERFORMANCE. 공연 목록을 최신 공연 우선으로 보여준다. |
| `/performance/:id` | 공연 상세. 공연별 콘텐츠와 테마를 보여준다. |
| `/about` | ABOUT. 프로필과 공연 이력을 보여준다. 공연 이력은 오래된 순서 우선이다. |
| `/contact` | CONTACT. 공식 연락 채널을 보여준다. |

## 데이터 파일

| 파일 | 용도 |
| --- | --- |
| `src/data/performances.ts` | 공연 목록, 상세 콘텐츠, 출연자, 아카이브 자료, 홈 히어로 테마 |
| `src/data/profile.ts` | 프로필, ABOUT 정보, 공연 이력 |
| `src/data/site.ts` | 사이트 공통 이름·연락·메타 정보 |
| `src/data/albums.ts` | 앨범 데이터 |

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
| 2026-08-02 | 해금, 시대를 잇다 | `haegeum-2026-08-02` | `/performance/haegeum-2026-08-02` | 해금 창작곡 변천을 기록하는 리사이틀형 테마 | `public/images/performance/2026-08-02/home/`, `archive/`, `performers/` |
| 2026-08-16 | 산조길, 둘 | `sanjo-gil-2026-08-16` | `/performance/sanjo-gil-2026-08-16` | 산조길 프로젝트의 마티에르형 공연 상세 테마 | `public/images/performance/2026-08-16/home/`, `detail/`, `archive/`, `performers/` |

자세한 공연 등록 절차는 [PERFORMANCE-WORKFLOW.md](./PERFORMANCE-WORKFLOW.md), 파일 규격은 [ASSET-SPECIFICATIONS.md](./ASSET-SPECIFICATIONS.md)를 따릅니다.

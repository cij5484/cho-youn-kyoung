# 앨범 등록 워크플로

- 마지막 확인 날짜: 2026-08-13
- 기준 commit SHA: `13ff9af`

앨범 작업도 공연 작업과 동일하게 원본 자료를 먼저 확인하고, 확정·권장·미확정 정보를 구분합니다. 아직 저장소에서 확정되지 않은 앨범 목록·상세·Viewer UI나 픽셀 규격은 **미확정**으로 표시합니다.


## WORKS 목록과 향후 상세 경로

- 앨범 Source of Truth는 계속 `src/data/albums.ts`이며 공연 데이터와 합치지 않습니다.
- `/works`의 `02 ALBUMS`는 `albums.ts`를 직접 소비합니다. `detailsPath`가 있으면 `VIEW →`, 실제 `streamingLinks`만 있으면 `LISTEN ↗`를 제공하고 어느 쪽도 없으면 가짜 action을 만들지 않습니다.
- 실제 상세 자료와 라우트가 준비된 향후 앨범 상세는 `/album/:id` 구조를 사용합니다. 상세 자료가 없는 앨범을 위해 임의 페이지를 만들지 않습니다.
- 앨범은 MEDIA DISCOGRAPHY에 중복 노출하지 않습니다.

## 먼저 받아야 할 자료

| 자료 | 상태 | 설명 |
| --- | --- | --- |
| 앨범명 | 확정 필요 | 표지, 음원 플랫폼, 보도자료 표기와 대조 |
| 발매일 | 확정 필요 | 연도만 있는 경우 전체 날짜는 미확정으로 둔다 |
| 앨범 소개 | 확정 필요 | 원문을 임의로 재작성하지 않는다 |
| 트랙 목록 | 확정 필요 | 트랙 번호, 제목, 길이, 악장 구분 확인 |
| 작곡·편곡·연주자 크레딧 | 확정 필요 | 이름, 역할, 표기 언어 확인 |
| 커버 이미지 | 확정 필요 | 웹용과 원본 인쇄·배포용을 구분 |
| 부클릿 이미지·PDF | 확정 필요 | Viewer용 이미지와 다운로드 PDF 분리 |
| 음원 플랫폼 링크 | 확정 필요 | 공식 URL만 사용 |
| 저작권·유통 정보 | 확정 필요 | 레이블, 유통사, 저작권 문구 확인 |
| 참여 연주자 | 확정 필요 | 공연 프로필 재사용 여부 확인 |
| 앨범별 테마 | 권장 | 앨범 고유 디자인은 앨범 테마 범위에 제한 |

## 권장 폴더 구조

```txt
public/assets/albums/{album-id}/
├─ web/
│  ├─ cover.png
│  └─ detail-hero-desktop.png
├─ viewer/
│  ├─ booklet-01.png
│  ├─ booklet-02.png
│  └─ ...
├─ downloads/
│  └─ booklet.pdf
└─ thumbnails/
   └─ media-{number}.jpg
```

공연과 앨범의 이미지 폴더를 섞지 않습니다. 공연 자료는 `public/assets/performances/`, 앨범 자료는 `public/assets/albums/` 아래에 둡니다.

- `web/cover.png`는 커버가 있을 때 사용합니다. `detail-hero-desktop.png`, 부클릿 Viewer 이미지와 PDF, 미디어 썸네일은 실제 필요한 경우에만 만듭니다.
- 실제 자산이 생기기 전에는 빈 폴더를 만들지 않습니다.
- Affinity 원본, TIFF, 인쇄 마스터, 편집 원본은 GitHub에 넣지 않습니다.
- Viewer 이미지는 `viewer/`, 다운로드 PDF는 `downloads/`에 두어 서로 분리합니다.
- 공용 인물 사진은 `public/assets/people/{person-id}/portrait.jpg`를 우선 사용하고, 앨범 전용 이미지는 필요한 경우에만 앨범 폴더에 둡니다.
- 파일명은 영문 소문자 kebab-case를 사용합니다. `final`, `최종`, `new`, `수정`, `(1)` 같은 버전명은 사용하지 않으며 버전 관리는 Git 기록으로 합니다.

## 원본 자료 검수

1. 앨범명, 발매일, 트랙명, 작곡·편곡·연주자 이름을 원본 자료와 대조합니다.
2. 음원 플랫폼 링크가 실제 공개 페이지인지 확인합니다.
3. 저작권·유통 정보는 임의 생성하지 않습니다.
4. 부클릿 문구를 웹용으로 축약해야 하면 사용자 승인을 받습니다.
5. 원본과 웹 문장이 달라진 경우 이유를 PR에 기록합니다.

## `src/data/albums.ts` 입력

현재 `Album` 타입의 필드는 다음과 같습니다.

| 필드 | 필수 여부 | 용도 |
| --- | --- | --- |
| `id` | 필수 | 앨범을 식별하는 영문 소문자 kebab-case ID |
| `title` | 필수 | 공식 앨범명 |
| `year` | 필수 | 확인된 발매 연도 문자열 |
| `description` | 필수 | 목록 등에 사용하는 짧은 앨범 소개 |
| `coverImage` | 선택 | 웹용 커버 이미지의 public 상대경로 |
| `detailsPath` | 선택 | 상세 화면이 실제로 생겼을 때 사용하는 경로 |
| `featured` | 선택 | 대표 앨범 노출 여부 |
| `releaseDate` | 선택 | 확인된 전체 발매일. 향후 `YYYY-MM-DD` 형식을 사용 |
| `tracks` | 선택 | 트랙 번호·제목과 트랙별 선택 정보를 담는 `AlbumTrack[]` |
| `participants` | 선택 | 앨범 참여자와 역할을 담는 `AlbumParticipant[]` |
| `credits` | 선택 | 앨범 전체 제작 크레딧을 담는 `AlbumCredit[]` |
| `booklet` | 선택 | Viewer 미리보기 이미지와 선택적 PDF 다운로드 정보 |
| `streamingLinks` | 선택 | 공식 스트리밍·음원 플랫폼 링크 목록 |
| `media` | 선택 | 관련 영상·이미지·기사 목록 |
| `downloads` | 선택 | 부클릿 외에 실제 제공하는 다운로드 목록 |

### 추가 타입

| 타입 | 용도 |
| --- | --- |
| `AlbumTrackCredit` | 한 트랙 안에서 역할과 이름을 연결하는 트랙별 크레딧 |
| `AlbumTrack` | 트랙 번호와 제목, 선택적 부제·재생 시간·트랙 크레딧 |
| `AlbumParticipant` | 참여자 이름·역할과 선택적 ID·이미지·설명 |
| `AlbumCredit` | 역할별 이름 목록과 선택적 섹션으로 구성한 앨범 전체 크레딧 |
| `AlbumBookletImage` | 부클릿 Viewer 이미지 경로·대체 텍스트와 선택적 라벨 |
| `AlbumBooklet` | 부클릿 미리보기 이미지 목록과 선택적 PDF URL·다운로드 라벨 |
| `AlbumStreamingLink` | 플랫폼 이름·공식 URL과 선택적 표시 라벨. 플랫폼은 고정 enum으로 제한하지 않음 |
| `AlbumMediaItem` | `video`, `image`, `article` 관련 자료와 선택적 URL·썸네일·설명 |
| `AlbumDownload` | 다운로드 라벨·URL과 선택적 파일 형식 |

트랙 크레딧(`AlbumTrackCredit`)과 앨범 전체 크레딧(`AlbumCredit`)은 범위가 다르므로 구분해 입력합니다. 확인되지 않은 정보는 데이터에 추가하지 않고, 빈 배열도 억지로 넣지 않습니다. 값이 없는 선택 필드는 생략하며 향후 UI에서는 데이터가 있을 때만 해당 섹션을 표시합니다. 상세 UI와 라우트는 실제 자료가 준비된 앨범에만 추가합니다.

HOME RECENT WORKS에는 확정 `releaseDate`, 실제 `coverImage`, 실제 `detailsPath`, 전용 Hero Scene이 모두 준비된 앨범만 연결합니다. 앨범 원본은 계속 `albums.ts`에서 관리하고 HOME adapter에는 원본 내용을 복사하지 않습니다. 자세한 연결 절차는 [HOME-HERO-WORKFLOW.md](./HOME-HERO-WORKFLOW.md)를 따릅니다.

## 향후 `albums.ts` 확장 필요사항

> **미확정 — 코드 작업 단계에서 설계:** 아래는 향후 HOME Album Hero와 앨범 상세 구현에 필요한 정보 범위이며, 현재 `Album` 타입에 존재하는 확정 필드명이 아닙니다. 이번 문서 작업에서는 TypeScript 타입을 변경하지 않습니다. 실제 필드명, 필수 여부와 타입은 구현을 시작할 때 현재 `albums.ts` 구조를 다시 검토해 확정합니다.

- 영문 앨범명
- 발매 상태(`COMING SOON`, `RELEASED` 등)
- 앨범 Hero 설정
- 실제 CD 라벨 이미지 경로
- 트랙별 외부 웹 재생 URL
- 앨범 상세 소개·본문
- 디지털 북클릿 설정

공식 플랫폼 링크와 자체 웹 재생 URL은 서로 다른 역할이므로 하나의 값으로 취급하지 않습니다. 확인되지 않은 값, 필드명 또는 URL을 미리 만들지 않습니다.

## HOME Album Hero 운영 방향

> **확정 운영 원칙 / 구현 미완료:** 앨범은 공연과 동일한 `RECENT WORKS` 선택 인터페이스에서 선택할 수 있는 독립 Hero Scene을 가집니다. 현재 `homeHeroSlides.ts`의 앨범 adapter와 `/album/:id` 라우트는 준비 조건을 문서화한 상태이며 실제 앨범 Hero는 아직 연결되지 않았습니다.

- `workType`은 `ALBUM`을 사용하고 앨범 전용 Hero Scene을 활성화합니다.
- 실제 앨범 커버를 핵심 시각 요소로 사용하며, 앨범 고유 디자인을 새로운 공통 디자인으로 덮어쓰지 않습니다.
- Hero에는 정보를 과도하게 넣지 않고 앨범명, 발매 연도 또는 `COMING SOON`, 간단한 트랙 정보, `VIEW ALBUM` 링크를 기본으로 표시합니다.
- 실제 상세페이지가 없으면 `VIEW ALBUM` 링크를 만들지 않습니다. 검증된 스트리밍 링크가 생긴 뒤 필요할 때만 `LISTEN` 링크를 별도 추가할 수 있습니다.
- 상세 트랙 목록, 크레딧과 북클릿은 Hero가 아니라 앨범 상세에서 제공합니다.

## 향후 Album Detail 기본 경험

> **권장 / 향후 앨범 상세 구현 시:** 다음 세 영역은 `/album/:id`가 실제로 구현될 때 적용할 기본 경험입니다. 현재 `App.tsx`에는 앨범 상세 라우트가 없으므로 구현 완료 기능으로 간주하지 않습니다.

### A. Virtual CD Player

- 실제 CD 라벨 이미지로 가상의 CD를 표현하고 트랙 목록과 함께 배치합니다.
- 트랙을 선택하면 해당 트랙을 재생합니다.
- 재생 중에는 CD가 천천히 자연스럽게 회전하고, 일시정지하면 회전도 자연스럽게 정지합니다.
- CD 회전과 UI는 CSS 및 브라우저 애니메이션을 우선 사용하며, 불필요한 대형 애니메이션 라이브러리를 먼저 도입하지 않습니다.
- `prefers-reduced-motion` 환경에서는 회전 등 비필수 애니메이션을 줄이거나 제거하되 재생과 트랙 선택 기능은 유지합니다.

### B. Web Audio

- 고음질 또는 웹 감상용 앨범 음원은 GitHub 저장소에 넣지 않는 방향을 기본으로 하며 외부 object storage/CDN 연결을 지원합니다. 현재 우선 검토 대상은 Cloudflare R2이지만 최종 저장소·배포 설정은 **미확정**입니다.
- 향후 트랙 데이터가 외부 재생 URL을 연결할 수 있도록 설계하되, 실제 필드명과 타입은 코드 작업 단계에서 확정합니다.
- Spotify, Apple Music, Melon, YouTube Music 등 공식 플랫폼으로 이동하는 링크와 사이트 안에서 재생하는 자체 웹 음원 URL의 역할을 구분합니다.
- 공식 스트리밍 플랫폼 링크나 웹 음원 URL이 확인되지 않았으면 임의 URL을 생성하지 않습니다.
- 일반 MEDIA용 로컬 오디오·영상과 앨범 상세용 외부 웹 음원의 저장 원칙은 서로 다릅니다. 구분은 [MEDIA-WORKFLOW.md](./MEDIA-WORKFLOW.md)를 함께 확인합니다.

### C. Digital Booklet

- 실제 CD 북클릿 페이지 이미지를 사용하며 원본 디자인과 내용을 임의로 재해석하지 않습니다.
- 단순 이미지 목록에 한정하지 않고 실제 종이를 넘기는 듯한 Viewer를 구현할 수 있도록 페이지 순서와 펼침면 정보를 설계합니다.
- Desktop에서는 실제 책과 같은 펼침면을 제공할 수 있고, Mobile에서는 터치·스와이프로 자연스럽게 페이지를 넘길 수 있어야 합니다.
- 페이지 넘김은 CSS + JavaScript 기반을 우선 검토하며, 키보드 조작과 `prefers-reduced-motion` 대응도 함께 설계합니다.
- PDF 다운로드와 디지털 북클릿 Viewer는 별도 역할로 유지할 수 있습니다.

## 검수

- 목록: 앨범 정렬과 대표 앨범 노출을 확인하고, 실제 커버가 있으면 커버가 표시되는지 확인합니다. 커버가 없으면 임시 박스 없이 앨범 정보가 텍스트 단일 열로 표시되는지 확인합니다.
- 상세: **미확정**. 상세 UI가 생기면 `/album/:id`, 헤더, 본문, 크레딧 확인
- Player: **미확정**. 향후 상세 UI가 생기면 트랙 선택·재생·일시정지, CD 회전 상태, reduced-motion, 외부 음원 URL 오류 fallback 확인
- Viewer: **미확정**. 향후 디지털 북클릿이 생기면 이미지 순서, Desktop 펼침면, Mobile touch/swipe, keyboard와 PDF 역할 분리 확인
- 다운로드: PDF URL, 파일명, 새 창/다운로드 동작 확인
- 회귀: 공연 Viewer와 공연 이미지 경로가 영향받지 않는지 확인

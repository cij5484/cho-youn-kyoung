# 앨범 등록 워크플로

- 마지막 확인 날짜: 2026-08-31
- 코드 대조 기준: `41d082b`. 구현 설명은 소스 확인 기준이며 외부 음원 재생·브라우저 검수의 새 완료 기록이 아니다.

## 한범수류 persistent detail 현황

- HOME→DETAIL에서 기존 배경·Canvas·package object를 유지하는 한범수류 전용 persistent stage를 구현했다.
- Viewer는 `viewer/booklet-01.webp`부터 `viewer/booklet-11.webp`까지의 런타임 자산을 사용한다. P1은 왼쪽 interior booklet panel과 tray panel에도 연결되어 있다.
- CD label과 HOME desktop/mobile 배경도 각각 `cd-label.webp`, `home-hero-desktop.webp`, `home-hero-mobile.webp`를 사용한다.
- 한범수류 전용 persistent stage와 `HanBeomSuAlbumDetail`/`HanBeomSuAlbumDetailExperience3D`가 활성화되어 HOME의 배경·Canvas·package object를 상세 진입까지 유지한다. 상세 상태는 `CLOSED / ALBUM_OPEN / BOOKLET_FOCUS / PLAYER_FOCUS`다.
- 여섯 트랙 모두 실제 Cloudflare R2 `webAudioUrl`에 연결되어 있다. CD를 선택하면 `PLAYER_FOCUS`로 이동하고, player와 booklet의 `BACK TO ALBUM`은 `ALBUM_OPEN`으로 복귀시킨다.

앨범 작업도 공연 작업과 동일하게 원본 자료를 먼저 확인하고, 확정·권장·미확정 정보를 구분합니다. 아직 저장소에서 확정되지 않은 앨범 목록·상세·Viewer UI나 픽셀 규격은 **미확정**으로 표시합니다.

## HOME 3D Hero 기반

- 앨범 전용 `AlbumHero`가 정보·링크와 stage 활성화를 담당한다. 현재 두 앨범의 배경·Canvas는 `App.tsx`의 앨범별 persistent stage가 소유하며, 내부에서 전용 detail 3D engine을 사용한다. 공용 `AlbumPackage3D`는 두 persistent ID 외 앨범을 위한 경로로 남아 있다. 공연 Hero 컴포넌트와 CSS는 재사용하지 않는다.
- 디지팩의 여섯 면 texture를 독립적으로 연결할 수 있고, texture가 없는 얇은 edge에는 artwork 없는 절제된 plastic material을 표시한다. 수동 조작에서 vertical tilt(X)는 ±28°로 제한하고 yaw(Y)는 제한 없이 여러 바퀴 회전할 수 있으며, drag 종료 뒤 감쇠되는 inertia를 적용한다. canvas 밖에서도 안전하게 해제되는 mouse/touch drag, frame damping, reduced-motion 대응과 제한 DPR을 기본으로 한다.
- 지영희류 앨범의 확정 데이터와 런타임 texture `front.webp`, `back.webp`, `spine.webp`를 연결했다. CD는 `cd-label.webp`, HOME 배경은 `home-hero-desktop.webp`와 `home-hero-mobile.webp`를 사용한다. 무광 종이 cover와 spine은 반투명 plastic tray보다 조금 크게 돌출되고, 반대쪽과 위·아래에서는 안쪽 트레이가 드러난다. 실제 조명에 반응하는 부드러운 저농도 shadow receiver와 넓어진 3D 안전 영역을 사용한다.
- HOME은 `albumHero.background`의 실제 desktop/mobile 전용 이미지를 `<picture>`로 선택해 사용한다. RECENT WORKS 앨범 cover는 강제 비율이나 crop 없이 실제 이미지 비율로 표시하며 공연 포스터 카드의 비율과 상태 동작은 바꾸지 않는다.
- 표지 크기의 투명 interaction plane으로 어느 면에서도 drag를 시작할 수 있다. 닫힌 persistent package는 느린 Y축 자동 회전을 하며 첫 mouse/touch 조작 즉시 중단되고 `prefers-reduced-motion`에서는 시작하지 않는다. 과거 공용 Scene의 22초 주기를 현재 두 Scene의 공통 고정값으로 사용하지 않는다.
- HOME 지영희류 Hero의 패키지는 desktop 약 10%, mobile 약 20% 축소하고 mobile에서 3D 위·정보 아래 순서가 한 배경 위에 끝까지 보이도록 배치한다. texture는 최대 8배 anisotropy, mipmap, 최대 2 DPR을 사용하며 오른쪽 위 key light와 반대 방향의 부드러운 실제 3D 그림자를 맞춘다. muted oxblood 계열은 작은 라벨·발매 상태·구분선·상세 링크에만 제한한다.
- 3D canvas는 패키지 박스가 아니라 Hero 전체를 덮는 visual stage에 둔다. shadow receiver의 끝이나 canvas 사각 경계가 드러나지 않아야 하며 정보·GNB·RECENT WORKS는 더 높은 interaction layer를 유지한다. drag target은 canvas 전체가 아닌 패키지 주변의 투명 plane으로 한정한다.
- 진입은 배경 즉시 표시, 패키지 선행 reveal, 정보 block 지연 reveal 순서다. `prefers-reduced-motion`에서는 숨은 초기 상태가 남지 않도록 opacity·filter·transform을 즉시 최종 상태로 둔다.
- 지영희류 geometry는 원본의 171:3000 비율(0.057)을 세네카 기준으로 사용한다. 이 값은 현재 WebP 파일의 실제 픽셀 크기를 뜻하지 않는다. 한범수류는 별도 `packageGeometry`를 사용하며 texture 비율과 tray·cover 두께를 함께 확인한다.
- `released` 앨범은 확정 `releaseDate`가 있어야 HOME에 노출한다. 날짜가 미정인 `coming-soon` 앨범은 확인된 `year`, 실제 `coverImage`, `detailsPath`, `albumHero`가 모두 있을 때 노출할 수 있다.


## WORKS 목록과 현재 상세 경로

- 앨범 Source of Truth는 계속 `src/data/albums.ts`이며 공연 데이터와 합치지 않습니다.
- `/works`의 `02 ALBUMS`는 `albums.ts`를 직접 소비합니다. `detailsPath`가 있으면 `VIEW →`, 실제 `streamingLinks`만 있으면 `LISTEN ↗`를 제공하고 어느 쪽도 없으면 가짜 action을 만들지 않습니다.
- 공통 `AlbumDetailPage`와 `/album/:id` 라우트가 앨범 ID를 조회하는 1차 구조로 구현되어 있습니다. WORKS의 상세 링크는 실제 자료가 준비되어 `detailsPath`를 설정한 앨범에만 노출합니다. 없는 ID는 공통 404로 처리합니다.
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
│  ├─ front.webp
│  ├─ back.webp
│  ├─ spine.webp
│  ├─ cd-label.webp
│  ├─ home-hero-desktop.webp
│  └─ home-hero-mobile.webp
├─ viewer/
│  ├─ booklet-01.webp
│  ├─ booklet-02.webp
│  └─ ...
└─ downloads/
   └─ booklet.pdf
```

공연과 앨범의 이미지 폴더를 섞지 않습니다. 공연 자료는 `public/assets/performances/`, 앨범 자료는 `public/assets/albums/` 아래에 둡니다.

- 사용자가 제공하는 원본 PNG는 작업·면 분리·색상 및 내용 검수용이다. 런타임 파일과 혼동하지 않으며, 보존이 필요하면 저장소 밖의 원본 보관 위치를 사용한다.
- GitHub에 배포하는 홈페이지 런타임 자산은 `web/`과 `viewer/` 아래의 WebP다. 면별 texture, CD label, HOME 배경과 Viewer 페이지는 위 명명 규칙을 따른다.
- PDF는 `downloads/` 아래에서 다운로드와 인쇄 확인용으로만 제공하며 이미지 texture 대신 자동 로드하지 않는다.
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
| `englishTitle` | 선택 | 공식 영문 앨범명 |
| `year` | 필수 | 확인된 발매 연도 문자열 |
| `releaseStatus` | 선택 | `coming-soon` 또는 `released` 발매 상태 |
| `description` | 필수 | 목록 등에 사용하는 짧은 앨범 소개 |
| `detailedDescription` | 선택 | 상세 화면의 긴 소개 본문 |
| `coverImage` | 선택 | 웹용 커버 이미지의 public 상대경로 |
| `cdLabelImage` | 선택 | 현재 3D CD Player가 사용하는 실제 CD 라벨 이미지 경로 |
| `albumHero` | 선택 | HOME Album Hero를 위한 전용 테마, desktop/mobile 배경과 실제 면별 texture 설정 |
| `detailExperience` | 선택 | 앨범 상세의 테마 식별자와 booklet/tray 내부 이미지. 현재 컴포넌트 선택은 앨범 ID 분기 |
| `detailsPath` | 선택 | 상세 화면이 실제로 생겼을 때 사용하는 경로 |
| `featured` | 선택 | 데이터에 남아 있는 대표 표식. 현재 HOME 기본 선정 함수에서는 사용하지 않음 |
| `releaseDate` | 선택 | 확인된 전체 발매일. `YYYY-MM-DD` 형식을 사용 |
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
| `AlbumTrack` | 트랙 번호와 제목, 선택적 부제·재생 시간·트랙 크레딧·`webAudioUrl` |
| `AlbumReleaseStatus` | 최소 발매 상태인 `coming-soon`, `released` |
| `AlbumHeroSettings` | 공연 Hero 타입과 분리된 앨범 전용 Hero 설정 |
| `AlbumDetailExperience` | 상세 테마 식별자와 `interior.bookletPanel` / `interior.trayPanel` 경로 |
| `AlbumParticipant` | 참여자 이름·역할과 선택적 ID·이미지·설명 |
| `AlbumCredit` | 역할별 이름 목록과 선택적 섹션으로 구성한 앨범 전체 크레딧 |
| `AlbumBookletImage` | 부클릿 Viewer 이미지 경로·대체 텍스트와 선택적 라벨 |
| `AlbumBooklet` | 부클릿 미리보기 이미지 목록과 선택적 PDF URL·다운로드 라벨 |
| `AlbumStreamingLink` | 플랫폼 이름·공식 URL과 선택적 표시 라벨. 플랫폼은 고정 enum으로 제한하지 않음 |
| `AlbumMediaItem` | `video`, `image`, `article` 관련 자료와 선택적 URL·썸네일·설명 |
| `AlbumDownload` | 다운로드 라벨·URL과 선택적 파일 형식 |

트랙 크레딧(`AlbumTrackCredit`)과 앨범 전체 크레딧(`AlbumCredit`)은 범위가 다르므로 구분해 입력합니다. 확인되지 않은 정보는 데이터에 추가하지 않고 빈 배열도 억지로 넣지 않습니다. 값이 없는 선택 필드는 생략하고 소비하는 UI의 조건부 표시를 확인합니다. 타입에 필드가 있다는 것만으로 해당 UI가 구현되었다고 판단하지 않습니다. 새 전용 상세는 자료와 구현이 함께 준비된 앨범에만 연결합니다.

HOME RECENT WORKS에는 확정 `releaseDate`가 있거나 위의 `coming-soon` 예외 조건을 충족하고, 실제 `coverImage`, `detailsPath`, 전용 Hero Scene이 모두 준비된 앨범만 연결합니다. 앨범 원본은 계속 `albums.ts`에서 관리하고 HOME adapter에는 원본 내용을 복사하지 않습니다. 자세한 연결 절차는 [HOME-HERO-WORKFLOW.md](./HOME-HERO-WORKFLOW.md)를 따릅니다.

## `albums.ts` 1차 상세 확장 구조

영문명(`englishTitle`), 발매 상태(`releaseStatus`), 앨범 전용 Hero 설정(`albumHero`), CD 라벨(`cdLabelImage`), 트랙별 외부 재생 URL(`webAudioUrl`), 상세 소개(`detailedDescription`)를 선택 필드로 정의했습니다. 공식 플랫폼 `streamingLinks`와 자체 웹 재생 URL은 역할을 분리합니다. 기존 앨범에는 확인되지 않은 값을 채우지 않습니다.

`booklet.previewImages` 배열 순서가 페이지 순서이며 각 항목이 이미지 경로와 대체 텍스트를 보유합니다. 현재 지영희류는 P1~P7, 한범수류는 P1~P11입니다. 두 앨범의 `booklet.downloadUrl`은 미등록이므로 폴더 예시의 `downloads/booklet.pdf`가 실제 제공된다고 해석하지 않습니다.

## HOME Album Hero 운영 방향

> **현재 구현:** 지영희류·한범수류 두 앨범은 공연과 동일한 `RECENT WORKS` 선택 인터페이스에서 각각의 persistent Hero Scene과 `/album/:id` 상세 경로로 연결됩니다.

- `workType`은 `ALBUM`을 사용하고 앨범 전용 Hero Scene을 활성화합니다.
- 실제 앨범 커버를 핵심 시각 요소로 사용하며, 앨범 고유 디자인을 새로운 공통 디자인으로 덮어쓰지 않습니다.
- Hero에는 정보를 과도하게 넣지 않고 앨범명, 발매 연도 또는 `COMING SOON`, 간단한 트랙 정보, `VIEW ALBUM` 링크를 기본으로 표시합니다.
- 실제 상세페이지가 없으면 `VIEW ALBUM` 링크를 만들지 않습니다. 검증된 스트리밍 링크가 생긴 뒤 필요할 때만 `LISTEN` 링크를 별도 추가할 수 있습니다.
- 상세 트랙 목록, 크레딧과 북클릿은 Hero가 아니라 앨범 상세에서 제공합니다.

## Album Detail 구현 상태 (2026-08-31)

지영희류와 한범수류 모두 앨범별 custom interactive detail과 persistent 3D stage가 활성화되어 있다. 두 구현의 상태는 `CLOSED / ALBUM_OPEN / BOOKLET_FOCUS / PLAYER_FOCUS` 네 가지이며, booklet과 player focus는 동시에 열리지 않는다. `AlbumDetailPage`는 두 앨범의 **ID**로 전용 detail 컴포넌트를 선택한다. `detailExperience.theme`만 추가해도 새 전용 화면이 자동 연결되는 구조는 아니다.

- 닫힌 디지팩은 느린 자동 회전과 click/drag 구분을 지원하고, 열 때 articulated hinge를 기준으로 front panel이 움직인다. 펼친 구성은 **왼쪽 booklet / 오른쪽 CD tray**다.
- interior artwork 위에 단순한 반투명 tray, 얕은 recess와 hub를 별도 3D 물성으로 올렸다. CD는 두께가 있는 plastic ring, outer rim, 실제 center hole, 별도 label surface로 구성한다.
- Digital Booklet은 각 앨범의 `booklet.previewImages` 등록 순서를 source of truth로 사용한다. 지영희류는 P1~P7, 한범수류는 P1~P11을 제공하며 버튼, 방향키와 mobile swipe로 탐색한다.
- Player는 track 선택, play/pause, 시간, seek, volume과 오류 상태를 갖춘다. 두 앨범의 등록 트랙은 실제 Cloudflare R2 `webAudioUrl`에 연결되어 있다. `PLAYER_FOCUS`에서는 정지 상태에도 CD가 천천히 회전하고 실제 음원이 재생되면 회전 속도가 빨라지며, `prefers-reduced-motion`에서는 회전하지 않는다. 현재 `PLAYER_FOCUS`에서는 package rig를 숨기고 CD를 별도 표시하며 `BACK TO ALBUM`으로 복귀한다.
- `prefers-reduced-motion`에서는 자동 회전, 큰 이동과 page transition을 제거하되 모든 기능을 유지한다. Canvas를 생성할 수 없으면 cover, tracks, credits와 해당 앨범에 등록된 booklet 페이지 grid를 제공하는 2D fallback을 사용한다.
- 앨범별 custom detail과 3D scene은 lazy-load한다. 단, desktop `AlbumAdjacentNavigation`은 idle 시 `preloadAlbumDetail`로 다음 앨범의 detail/scene 모듈, desktop 배경, 앞·뒤·세네카, CD 라벨, P1과 내부 패널 이미지를 미리 준비한다. NEXT ALBUM 클릭 시에는 대상 persistent stage 준비를 기다린다. 따라서 서로의 bundle을 전혀 요청하지 않는다고 설명하지 않는다.

### 미등록 정보와 재생 검수 경계

- 지영희류는 `coming-soon`이며 정확한 발매일·공식 플랫폼 `streamingLinks`가 없다. R2 트랙 URL 등록과 공식 발매·유통 링크 공개를 구분한다.
- 한범수류는 `released`, `releaseDate: '2020-11-19'`이며 YouTube 재생목록 링크가 있다.
- `useAlbumAudio`에는 `webAudioUrl`이 없는 트랙의 무음 미리보기 타이머가 남아 있다. 재생 버튼이나 CD 회전만으로 실제 음원 재생 성공을 판정하지 않는다. 현재 등록된 12개 트랙에는 모두 URL이 있다.
- 두 앨범의 북클릿 PDF URL은 미등록이다. 다운로드 UI는 실제 데이터와 제공 파일을 확인한 뒤 안내한다.

### 과거 기록: 지영희류 상세 UX 보정 (2026-08-18)

> 아래는 당시 작업에서 사용한 원본 치수와 UX 조정 기록이다. 현재 WebP 픽셀 규격이나 모든 viewport의 표시 크기를 보증하지 않는다. 현재 HOME·상세는 persistent stage를 공유하므로 session storage만으로 장면을 인계하는 구조로 해석하지 않는다.

- HOME과 상세의 닫힌 외형은 `packageGeometry.ts`의 panel, cover overhang, cover depth, spine ratio 계산을 함께 사용한다. HOME에서 마지막으로 보인 회전값은 session storage로 상세 CLOSED의 초기값에 전달하며, 저장값이 없으면 기존 초기 회전을 사용한다.
- 저장소의 실제 web export 크기(front 3000×2686, back 3000×2657, spine 171×3000)는 상세 articulated geometry의 비율 계산에 사용한다. HOME은 기존 정사각 silhouette과 크기를 유지하도록 선택적 `packageGeometry`를 추가하지 않는다. 별도 원본 PDF는 이 checkout에 없으므로 PDF 재검수나 재-export 완료를 주장하지 않는다.
- mobile CLOSED, OPEN, PLAYER 크기는 world 상수가 아니라 실제 cover width, spread width, CD diameter를 기준으로 viewport world width에서 각각 69vw, 90vw, 58vw를 역산한다. mobile booklet reader는 focus depth에서의 viewport와 실제 page width로 약 88vw scale을 별도 계산한다. CD는 panel height의 90%, booklet은 92%, tray는 panel 안쪽의 95%를 사용한다.
- P2~P7 loader는 scene 내부 nested Suspense에 격리한다. 상세 페이지 texture가 suspend되어도 core digipack, tray/CD와 P1을 포함한 Canvas 전체는 교체되지 않는다.
- 인쇄 artwork plane(front/back/spine/booklet/CD label)은 tone mapping을 끈 unlit material로 표시하고, 별도 paper/plastic backing이 조명과 그림자를 담당한다. 원본 이미지 자체의 색이나 대비는 재가공하지 않는다.
- PC booklet 탐색은 실제 좌우 page mesh의 pointer event를 우선 사용한다. mobile은 P2~P7 single page를 유지하고 `READ PAGE`에서 고해상도 2D modal을 제공한다.
- tray와 mounted CD는 CLOSED/ALBUM_OPEN에서 동일한 local Z를 유지하며 back inner surface와 front inner surface 사이에 수납한다. PLAYER 진입에서만 CD를 lift하고 booklet/tray fade·slide·scale settle 뒤 HTML player를 표시한다. connector 시작점은 CD world position을 camera projection한 screen coordinate를 사용한다.

### Album Detail 3D 공통 제작 원칙

수치·페이지 펼침 예시는 지영희류 기준을 포함한다. 한범수류에는 전용 geometry와 11페이지 구성이 있으므로 그대로 복사하지 말고 해당 engine과 `albums.ts`를 함께 확인한다.

- detail Canvas는 header 아래 viewport 전체를 덮는 **고정 full-stage**다. mode마다 Canvas bounds를 바꾸지 않고 `packageRig`, `BookletRig`, `CdRig`, `trayRig`의 world transform만 보간한다.
- CLOSED package의 회전 pivot은 front/back cover의 기하학적 정중앙이며 배경 anchor와 같은 screen-space 기준을 유지한다. package rotation pivot과 front-cover hinge pivot은 서로 다른 개념이므로, hinge 좌표계를 package 중앙 회전에 그대로 사용하지 않는다.
- spine은 fixed assembly member이며 front-cover hinge의 child가 아니다. 실제 `171 / 3000` 폭의 인쇄 면은 닫힘, 열림 도중, 완전 열림에서 계속 중앙 연결부에 남는다.
- front cover는 음의 Y 방향으로 회전해 먼저 viewer 쪽을 지나 왼쪽 interior/booklet panel로 열리며, 오른쪽 back/tray panel은 고정된다.
- CLOSED에서는 CD, hub, recess, booklet 같은 내부 부품을 렌더링 순서로 감추지 않는다. 내부는 cover 뒤에 물리적으로 놓고 hinge가 열린 뒤 cover에 가려져 있던 구조가 자연스럽게 드러나야 한다.
- Detail CLOSED 위치는 HOME과 동일하게 배경 원본 anchor와 `object-fit: cover` scale/crop을 screen-space에서 계산해 world X로 변환한다. 배경은 header를 포함한 stage, Canvas는 header 아래 영역이므로 `ResizeObserver`로 측정한 실제 stage width/height를 cover 계산의 source of truth로 사용하며, 고정 world X나 Canvas height로 배경 관계를 흉내 내지 않는다.
- OPEN 요청 시 내부 `OPENING` 상태 하나에서 현재 회전을 가장 가까운 정면 yaw와 open pitch로 보간하는 동시에 package를 open framing으로 이동·확대하고 hinge를 약 160° 연다. 정렬, hinge와 package transform이 모두 허용 오차에 들어오면 `IDLE`로 전환해 조작을 다시 허용한다.
- CLOSED package center와 펼친 spread의 실제 bounding center는 별도로 계산한다. OPEN framing을 CLOSED pivot이나 배경 anchor를 이동시켜 보정하지 않는다.
- spine은 artwork의 실제 `171 / 3000` 비율을 사용하고 surface에 극소 offset을 두어 z-fighting만 방지한다. 빈 두꺼운 box를 spine 대용으로 만들지 않는다.
- booklet geometry는 texture의 native `width / height`에서 계산한다. P1을 source of truth로 한 trim 크기를 유지하며 고정 세로 비율로 모든 페이지를 늘이지 않는다.
- 하나의 persistent `BookletRig`가 panel 위의 P1 상태에서 떠올라 focus 위치로 이동한다. cover sheet의 앞은 P1, 뒤는 P2이고 오른쪽 base page는 P3이며, 펼침 순서는 `P2/P3 → P4/P5 → P6/P7`이다. BACK도 같은 rig가 P1으로 닫혀 panel에 돌아가는 reverse motion이다.
- Booklet focus 진입은 **closed P1 lift → closed P1 focus 이동/확대 → 위치 settle 후 cover open**의 순차 transition으로 실행한다. 큰 cover가 화면을 가로질러 이동하는 동안 펼치지 않는다.
- BOOKLET_FOCUS에서도 open digipack과 오른쪽 tray/CD를 축소·후퇴한 배경 context로 남겨, 별도 문서 viewer가 아니라 앨범에서 booklet을 꺼낸 공간 관계를 유지한다.
- page turn은 page 전체 pivot을 rigid 180° 회전하는 방식으로 만들지 않는다. segmented plane의 gutter column부터 outer edge까지 지연된 local progress를 적용하고 X 이동과 작은 Z curl을 변형해 종이처럼 넘긴다. reverse turn에도 같은 deformation을 사용하며 카메라 쪽 과도한 돌출을 금지한다.
- turning page의 front/back은 동일한 deformed sheet shape를 공유한다. 두 면은 paper thickness만큼만 떨어뜨리고 `FrontSide`/`BackSide`를 각각 사용하며, backside 전용 UV를 적용해 겹침·flicker·mirror를 방지한다.
- CD 본체와 label은 거의 불투명하며 label opacity는 1이다. 약한 반투명 plastic은 outer rim과 center-hole rim에만 사용한다. 종이 interior 위에는 별도 frosted tray plate, shallow recess, guide, hub와 edge를 둔다.
- interior paper, tray, booklet page는 shadow를 받고 booklet/CD는 그림자를 만든다. full-stage 뒤에는 canvas 경계보다 넓은 저농도 `shadowMaterial` receiver를 둔다.
- PLAYER_FOCUS desktop에서는 3D album/CD 영역과 오른쪽 tracks panel의 viewport 영역을 분리하고 충분한 시각적 gap을 둔다. tracks UI가 CD나 tray 위를 덮도록 배치하지 않는다.
- PLAYER_FOCUS의 주 transition은 package의 큰 이동/축소가 아니라 hub에 붙어 있던 CD의 작고 명확한 lift다. `PLAYER_FOCUS`에 진입하면 느린 idle rotation을 시작하고 `audio.playing === true`일 때 더 빠르게 회전한다. `PLAYER_FOCUS`가 아니면 target velocity는 0이며, `prefers-reduced-motion`에서는 회전하지 않는다.
- HOME의 `CLOSED` package는 front/back/spine을 중심으로 먼저 로드한다. detail 준비 단계에서 양쪽 interior booklet/tray panel, CD label과 booklet P1을 로드한다. 이후 booklet 페이지는 `BOOKLET_FOCUS`에서 reader가 mount될 때 필요에 따라 로드하며 renderer capability 기반 anisotropy를 core와 detail texture 모두에 적용한다.
- PDF와 audio 파일은 초기 화면에서 자동 preload하지 않는다. 현재 `useAlbumAudio`는 재생 버튼의 `toggle`에서 audio element를 생성하며 `preload='metadata'`를 설정한다. 트랙 선택만으로는 새 audio element를 생성하지 않고, 실제 재생을 시작하면 음원 데이터도 전송된다. PDF는 URL이 등록된 다운로드 동작으로만 요청한다. 이 우선순위는 [ASSET-OPTIMIZATION-PLAN.md](./ASSET-OPTIMIZATION-PLAN.md)의 로딩 정책을 따른다.

## 검수

- 목록: WORKS의 최신 연도순 텍스트 행과 VIEW/LISTEN/비활성 분기, RECENT WORKS의 실제 cover 비율을 확인합니다. ABOUT은 `profile.discography[0]` 한 항목을 소개하므로 전체 앨범 목록과 구분합니다.
- 상세: `/album/:id`의 조건부 섹션, 없는 ID의 공통 404, HOME·WORKS 복귀 링크를 확인
- Player: 실제 `webAudioUrl` track 선택·재생·pause·seek, `PLAYER_FOCUS`와 `BACK TO ALBUM`, CD 감속, reduced-motion과 audio error fallback 확인
- Viewer: 지영희류 P1~P7과 한범수류 P1~P11의 앨범별 등록 순서, desktop/mobile navigation, keyboard와 마지막 페이지 경계 확인
- 다운로드: PDF URL, 파일명, 새 창/다운로드 동작 확인
- 회귀: 공연 Viewer와 공연 이미지 경로가 영향받지 않는지 확인

## 2020 한범수류 HOME Hero와 상세 연결 (2026-08-31)

- `han-beom-su-haegeum-sanjo-2020`은 2020-11-19 발매 앨범으로 HOME 3D Hero, RECENT WORKS와 전용 persistent `/album/:id` 상세에 연결되어 있다.
- 런타임 외부 면은 `public/assets/albums/han-beom-su-haegeum-sanjo-2020/web/`의 `front.webp`, `back.webp`, `spine.webp`를 사용하고 CD는 `cd-label.webp`를 사용한다. 데이터의 3320×2946 / 3317×2946 / 182×2946은 원본 geometry 기준 치수로, 현재 WebP 파일 픽셀 크기와 구분한다.
- HOME 배경은 같은 폴더의 `home-hero-desktop.webp`와 `home-hero-mobile.webp`를 사용한다. HOME의 닫힌 package에서는 CD label을 로드하지 않고 상세 준비 시 interior와 함께 로드한다.
- Viewer는 `viewer/booklet-01.webp`부터 `booklet-11.webp`까지 사용한다. P1은 interior booklet/tray panel에도 사용하며, 나머지 페이지는 `BOOKLET_FOCUS`에서 필요할 때 로드한다.
- 전용 상세는 `CLOSED / ALBUM_OPEN / BOOKLET_FOCUS / PLAYER_FOCUS`를 제공한다. CD 선택으로 `PLAYER_FOCUS`에 진입하고 booklet/player의 `BACK TO ALBUM`으로 열린 앨범에 복귀한다.
- 여섯 트랙의 실제 Cloudflare R2 `webAudioUrl`이 등록되어 player에서 재생·pause·seek할 수 있다.
- 한범수류는 muted warm ivory 전경과 desaturated teal accent를 쓰는 dark teal painterly visual system이다. 지영희류의 oxblood 밝은 테마와 분리한다.
- `AlbumHeroSettings.backgroundAnchor`는 원본 배경 크기와 x anchor를 앨범별로 보관한다. `object-fit: cover`의 scale과 crop offset을 screen-space에서 계산하며 한범수류는 desktop `0.43`, mobile `0.50`을 사용한다.
- 선택적 `packageGeometry`는 front/back/spine의 native pixel dimensions를 기록한다. 공용 Scene은 이를 같은 cover 높이로 정규화해 각 면의 실제 가로세로 비율과 spine 깊이를 보존한다. 값이 없는 지영희류는 기존 geometry를 그대로 사용해 회귀를 막는다.
- mobile은 지영희류와 동일하게 위쪽 3D 패키지, 아래쪽 정보가 하나의 연속 배경 위에 놓이는 구조다.

# 앨범 등록 워크플로

- 마지막 확인 날짜: 2026-08-15

앨범 작업도 공연 작업과 동일하게 원본 자료를 먼저 확인하고, 확정·권장·미확정 정보를 구분합니다. 아직 저장소에서 확정되지 않은 앨범 목록·상세·Viewer UI나 픽셀 규격은 **미확정**으로 표시합니다.

## HOME 3D Hero 기반

- 앨범 전용 `AlbumHero`와 Three.js + React Three Fiber 기반 `AlbumPackage3D`가 구현되어 있다. 공연 Hero 컴포넌트와 CSS는 재사용하지 않는다.
- 디지팩의 여섯 면 texture를 독립적으로 연결할 수 있고, texture가 없는 얇은 edge에는 artwork 없는 절제된 plastic material을 표시한다. 수동 X축 ±28°·Y축 ±168° 제한 회전, canvas 밖에서도 안전하게 해제되는 mouse/touch drag, frame damping, reduced-motion 대응과 제한 DPR을 기본으로 한다.
- 지영희류 앨범의 확정 데이터와 기존 `front.png`, `back.png`, `spine.png`를 연결했다. 무광 종이 cover와 spine은 반투명 plastic tray보다 조금 크게 돌출되고, 반대쪽과 위·아래에서는 안쪽 트레이가 드러난다. 실제 조명에 반응하는 부드러운 저농도 shadow receiver와 넓어진 3D 안전 영역을 사용한다.
- HOME은 `albumHero.background`의 실제 desktop/mobile 전용 이미지를 `<picture>`로 선택해 사용한다. RECENT WORKS 앨범 cover는 강제 비율이나 crop 없이 실제 이미지 비율로 표시하며 공연 포스터 카드의 비율과 상태 동작은 바꾸지 않는다.
- 표지 크기의 투명 interaction plane으로 어느 면에서도 drag를 시작할 수 있다. 진입 시 Y축 단방향 자동 회전은 약 22초에 한 바퀴이며 첫 mouse/touch 조작 즉시 중단되고 `prefers-reduced-motion`에서는 시작하지 않는다.
- HOME 지영희류 Hero의 패키지는 desktop 약 10%, mobile 약 20% 축소하고 mobile에서 3D 위·정보 아래 순서가 한 배경 위에 끝까지 보이도록 배치한다. texture는 최대 8배 anisotropy, mipmap, 최대 2 DPR을 사용하며 오른쪽 위 key light와 반대 방향의 부드러운 실제 3D 그림자를 맞춘다. muted oxblood 계열은 작은 라벨·발매 상태·구분선·상세 링크에만 제한한다.
- 3D canvas는 패키지 박스가 아니라 Hero 전체를 덮는 visual stage에 둔다. shadow receiver의 끝이나 canvas 사각 경계가 드러나지 않아야 하며 정보·GNB·RECENT WORKS는 더 높은 interaction layer를 유지한다. drag target은 canvas 전체가 아닌 패키지 주변의 투명 plane으로 한정한다.
- 진입은 배경 즉시 표시, 패키지 선행 reveal, 정보 block 지연 reveal 순서다. `prefers-reduced-motion`에서는 숨은 초기 상태가 남지 않도록 opacity·filter·transform을 즉시 최종 상태로 둔다.
- `spine.png`의 실제 171×3000 비율(0.057)을 세네카 geometry의 기준으로 삼는다. texture를 비균등 scale하지 않고 tray와 종이 cover 두께를 함께 조정해 얇은 디지팩 비율을 유지한다.
- `released` 앨범은 확정 `releaseDate`가 있어야 HOME에 노출한다. 날짜가 미정인 `coming-soon` 앨범은 확인된 `year`, 실제 `coverImage`, `detailsPath`, `albumHero`가 모두 있을 때 노출할 수 있다.


## WORKS 목록과 향후 상세 경로

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
| `englishTitle` | 선택 | 공식 영문 앨범명 |
| `year` | 필수 | 확인된 발매 연도 문자열 |
| `releaseStatus` | 선택 | `coming-soon` 또는 `released` 발매 상태 |
| `description` | 필수 | 목록 등에 사용하는 짧은 앨범 소개 |
| `detailedDescription` | 선택 | 상세 화면의 긴 소개 본문 |
| `coverImage` | 선택 | 웹용 커버 이미지의 public 상대경로 |
| `cdLabelImage` | 선택 | 향후 Virtual CD Player가 사용할 실제 CD 라벨 이미지 경로 |
| `albumHero` | 선택 | HOME Album Hero를 위한 전용 테마, desktop/mobile 배경과 실제 면별 texture 설정 |
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
| `AlbumTrack` | 트랙 번호와 제목, 선택적 부제·재생 시간·트랙 크레딧·`webAudioUrl` |
| `AlbumReleaseStatus` | 최소 발매 상태인 `coming-soon`, `released` |
| `AlbumHeroSettings` | 공연 Hero 타입과 분리된 앨범 전용 Hero 설정 |
| `AlbumParticipant` | 참여자 이름·역할과 선택적 ID·이미지·설명 |
| `AlbumCredit` | 역할별 이름 목록과 선택적 섹션으로 구성한 앨범 전체 크레딧 |
| `AlbumBookletImage` | 부클릿 Viewer 이미지 경로·대체 텍스트와 선택적 라벨 |
| `AlbumBooklet` | 부클릿 미리보기 이미지 목록과 선택적 PDF URL·다운로드 라벨 |
| `AlbumStreamingLink` | 플랫폼 이름·공식 URL과 선택적 표시 라벨. 플랫폼은 고정 enum으로 제한하지 않음 |
| `AlbumMediaItem` | `video`, `image`, `article` 관련 자료와 선택적 URL·썸네일·설명 |
| `AlbumDownload` | 다운로드 라벨·URL과 선택적 파일 형식 |

트랙 크레딧(`AlbumTrackCredit`)과 앨범 전체 크레딧(`AlbumCredit`)은 범위가 다르므로 구분해 입력합니다. 확인되지 않은 정보는 데이터에 추가하지 않고, 빈 배열도 억지로 넣지 않습니다. 값이 없는 선택 필드는 생략하며 향후 UI에서는 데이터가 있을 때만 해당 섹션을 표시합니다. 상세 UI와 라우트는 실제 자료가 준비된 앨범에만 추가합니다.

HOME RECENT WORKS에는 확정 `releaseDate`가 있거나 위의 `coming-soon` 예외 조건을 충족하고, 실제 `coverImage`, `detailsPath`, 전용 Hero Scene이 모두 준비된 앨범만 연결합니다. 앨범 원본은 계속 `albums.ts`에서 관리하고 HOME adapter에는 원본 내용을 복사하지 않습니다. 자세한 연결 절차는 [HOME-HERO-WORKFLOW.md](./HOME-HERO-WORKFLOW.md)를 따릅니다.

## `albums.ts` 1차 상세 확장 구조

영문명(`englishTitle`), 발매 상태(`releaseStatus`), 앨범 전용 Hero 설정(`albumHero`), CD 라벨(`cdLabelImage`), 트랙별 외부 재생 URL(`webAudioUrl`), 상세 소개(`detailedDescription`)를 선택 필드로 정의했습니다. 공식 플랫폼 `streamingLinks`와 자체 웹 재생 URL은 역할을 분리합니다. 기존 앨범에는 확인되지 않은 값을 채우지 않습니다.

`booklet.previewImages` 배열 순서가 페이지 순서이며 각 항목이 이미지 경로와 대체 텍스트를 보유합니다. 지영희류는 확정된 P1~P7만 등록합니다.

## HOME Album Hero 운영 방향

> **구현 완료:** 지영희류 앨범은 공연과 동일한 `RECENT WORKS` 선택 인터페이스에서 독립 Hero Scene과 `/album/:id` 상세 경로로 연결됩니다.

- `workType`은 `ALBUM`을 사용하고 앨범 전용 Hero Scene을 활성화합니다.
- 실제 앨범 커버를 핵심 시각 요소로 사용하며, 앨범 고유 디자인을 새로운 공통 디자인으로 덮어쓰지 않습니다.
- Hero에는 정보를 과도하게 넣지 않고 앨범명, 발매 연도 또는 `COMING SOON`, 간단한 트랙 정보, `VIEW ALBUM` 링크를 기본으로 표시합니다.
- 실제 상세페이지가 없으면 `VIEW ALBUM` 링크를 만들지 않습니다. 검증된 스트리밍 링크가 생긴 뒤 필요할 때만 `LISTEN` 링크를 별도 추가할 수 있습니다.
- 상세 트랙 목록, 크레딧과 북클릿은 Hero가 아니라 앨범 상세에서 제공합니다.

## Album Detail 구현 상태 (2026-08-15)

지영희류에는 공통 상세와 분리된 custom interactive detail이 활성화되어 있다. 상태는 `CLOSED / ALBUM_OPEN / BOOKLET_FOCUS / PLAYER_FOCUS` 네 가지이며, booklet과 player focus는 동시에 열리지 않는다. 한범수류는 현재 공통 generic `AlbumDetailPage`를 그대로 사용하며 전용 상세는 후속 작업이다.

- 닫힌 디지팩은 느린 자동 회전과 click/drag 구분을 지원하고, 열 때 articulated hinge를 기준으로 front panel이 움직인다. 펼친 구성은 **왼쪽 booklet / 오른쪽 CD tray**다.
- interior artwork 위에 단순한 반투명 tray, 얕은 recess와 hub를 별도 3D 물성으로 올렸다. CD는 두께가 있는 plastic ring, outer rim, 실제 center hole, 별도 label surface로 구성한다.
- Digital Booklet은 실제 P1~P7만 사용한다. P1은 닫힌 표지이며 desktop spread는 `P2/P3 → P4/P5 → P6/P7`, mobile은 읽기 쉬운 single-page focus로 P2부터 P7까지 탐색한다. **P8은 의도적으로 존재하지 않는다.** 버튼, 방향키와 mobile swipe를 제공한다.
- Player는 track 선택, play/pause, 시간, seek와 오류 상태를 갖춘 audio-ready 구조다. 실제 `webAudioUrl`이 있는 트랙만 재생하며 현재 지영희류에는 URL이 없어 Play가 비활성화되고 `AUDIO COMING SOON`을 표시한다. 가짜 재생이나 CD 회전은 없다.
- `prefers-reduced-motion`에서는 자동 회전, 큰 이동과 page transition을 제거하되 모든 기능을 유지한다. Canvas를 생성할 수 없으면 cover, tracks, credits와 P1~P7 grid를 제공하는 2D fallback을 사용한다.
- custom detail과 3D scene은 route 진입 뒤 lazy-load되므로 한범수류 generic detail에서 지영희류 scene bundle을 요청하지 않는다. HOME의 `AlbumPackage3D`는 수정하지 않았으며 상세용 articulated engine은 별도 컴포넌트로 유지한다.

### Album Detail 3D 공통 제작 원칙

- detail Canvas는 header 아래 viewport 전체를 덮는 **고정 full-stage**다. mode마다 Canvas bounds를 바꾸지 않고 `packageRig`, `BookletRig`, `CdRig`, `trayRig`의 world transform만 보간한다.
- CLOSED package의 회전 pivot은 front/back cover의 기하학적 정중앙이며 배경 anchor와 같은 screen-space 기준을 유지한다. package rotation pivot과 front-cover hinge pivot은 서로 다른 개념이므로, hinge 좌표계를 package 중앙 회전에 그대로 사용하지 않는다.
- spine은 fixed assembly member이며 front-cover hinge의 child가 아니다. 실제 `171 / 3000` 폭의 인쇄 면은 닫힘, 열림 도중, 완전 열림에서 계속 중앙 연결부에 남는다.
- front cover는 음의 Y 방향으로 회전해 먼저 viewer 쪽을 지나 왼쪽 interior/booklet panel로 열리며, 오른쪽 back/tray panel은 고정된다.
- CLOSED에서는 CD, hub, recess, booklet 같은 내부 부품을 렌더링 순서로 감추지 않는다. 내부는 cover 뒤에 물리적으로 놓고 hinge가 열린 뒤 cover에 가려져 있던 구조가 자연스럽게 드러나야 한다.
- Detail CLOSED 위치는 HOME과 동일하게 배경 원본 anchor, `object-fit: cover` scale/crop, viewport를 screen-space에서 계산해 world X로 변환한다. 고정 world X로 배경과의 관계를 흉내 내지 않는다.
- OPEN 요청은 **`ALIGN_CLOSED → POSITION_FOR_OPEN → HINGE_OPEN`** 세 단계다. 현재 회전에서 front까지 shortest path로 정렬하는 동안에는 closed position/scale과 모든 internal rig를 그대로 유지하고, 정렬 뒤 닫힌 package 전체만 open framing으로 옮긴 다음에만 hinge를 약 160° 연다.
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
- PLAYER_FOCUS의 주 transition은 package의 큰 이동/축소가 아니라 hub에 붙어 있던 CD의 작고 명확한 lift다. 실제 `webAudioUrl`과 `audio.playing === true`가 아니면 트랙 선택만으로 CD를 회전시키지 않는다.
- core texture는 front/back/spine, 양쪽 interior, CD label, P1까지만 최초 로드한다. P2~P7은 별도 booklet component가 focus에서 mount될 때 lazy-load하며 renderer capability 기반 anisotropy를 core와 detail texture 모두에 적용한다.

## 검수

- 목록: 앨범 정렬과 대표 앨범 노출을 확인하고, 실제 커버가 있으면 커버가 표시되는지 확인합니다. 커버가 없으면 임시 박스 없이 앨범 정보가 텍스트 단일 열로 표시되는지 확인합니다.
- 상세: `/album/:id`의 조건부 섹션, 없는 ID의 공통 404, HOME·WORKS 복귀 링크를 확인
- Player: track 선택, 음원 없는 disabled 상태, future `webAudioUrl` 재생·pause·seek, CD 감속, reduced-motion과 audio error fallback 확인
- Viewer: P1~P7 순서, Desktop 세 펼침면, Mobile P2~P7 touch/swipe, keyboard와 마지막 페이지 경계 확인
- 다운로드: PDF URL, 파일명, 새 창/다운로드 동작 확인
- 회귀: 공연 Viewer와 공연 이미지 경로가 영향받지 않는지 확인

## 2020 한범수류 HOME Hero 연결 (2026-08-15)

- `han-beom-su-haegeum-sanjo-2020`은 2020-11-19 발매 앨범으로 HOME 3D Hero, RECENT WORKS, 공통 `/album/:id` 최소 상세 경로에 연결했다. 최종 한범수류 상세 디자인과 ABOUT 반영은 아직 미완성이며 별도 작업으로 진행한다.
- 실제 자산은 `public/assets/albums/han-beom-su-haegeum-sanjo-2020/web/`의 `front.webp`(3320×2946), `back.webp`(3317×2946), `spine.webp`(182×2946), `cd-label.png`(2883×2883)를 사용한다. CD label은 데이터 경로만 등록하며 HOME에서는 로드하거나 표시하지 않는다.
- HOME 배경은 같은 폴더의 `home-hero-desktop.png`(3840×2160), `home-hero-mobile.png`(1440×2560)를 원본 그대로 사용한다. 배경에 filter, crop, 재압축을 적용하지 않는다.
- 한범수류는 muted warm ivory 전경과 desaturated teal accent를 쓰는 dark teal painterly visual system이다. 지영희류의 oxblood 밝은 테마와 분리한다.
- `AlbumHeroSettings.backgroundAnchor`는 원본 배경 크기와 x anchor를 앨범별로 보관한다. `object-fit: cover`의 scale과 crop offset을 screen-space에서 계산하며 한범수류는 desktop `0.43`, mobile `0.50`을 사용한다.
- 선택적 `packageGeometry`는 front/back/spine의 native pixel dimensions를 기록한다. 공용 Scene은 이를 같은 cover 높이로 정규화해 각 면의 실제 가로세로 비율과 spine 깊이를 보존한다. 값이 없는 지영희류는 기존 geometry를 그대로 사용해 회귀를 막는다.
- mobile은 지영희류와 동일하게 위쪽 3D 패키지, 아래쪽 정보가 하나의 연속 배경 위에 놓이는 구조다.

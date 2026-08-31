# HOME Hero와 RECENT WORKS 운영 워크플로

- 코드 대조 날짜: 2026-08-31 (`41d082b`)

## 역할과 대표 Work 선정

HOME Hero는 대표 Work를 안정적으로 소개하고, `RECENT WORKS`는 공개된 공연·앨범의 고유 Hero Scene을 사용자가 선택하게 한다. 자동 순환은 사용하지 않는다.

`homeHeroSlides.ts`의 `getDefaultHomeHeroIndex`는 다음 순서로 선택한다.

1. `DEFAULT_HOME_HERO_ID`가 노출 목록에 있으면 날짜와 관계없이 우선한다. 현재 값은 `haegeum-jeongak-2026-09-22`다.
2. 지정 ID가 없으면 서울 날짜 기준 아직 지나지 않은 Work 중 가장 가까운 날짜를 선택한다.
3. 모두 지났다면 날짜가 있는 가장 최신 Work, 날짜가 전혀 없으면 첫 항목을 선택한다.

`featured` 값은 이 HOME 선정 함수에서 사용하지 않는다. 지정 공연은 날짜가 지나도 자동 해제되지 않으므로 대표 Work 교체 때 지정 ID와 fallback을 함께 확인한다.

## 데이터 연결

- 공연 Source of Truth는 `src/data/performances.ts`, 앨범 Source of Truth는 `src/data/albums.ts`이다. 두 파일을 합치거나 내용을 복사하지 않는다.
- `src/data/homeHeroSlides.ts`는 HOME 전용 adapter이다. `homeHero`가 있고 POSTER Viewer 자산이 있는 공연을 RECENT WORKS 모델로 조합한다.
- 앨범은 실제 커버, 상세 경로, 전용 Hero Scene이 모두 있을 때 같은 adapter에서 조합한다. `released`는 확정 발매일이 필요하고, 날짜 미정 `coming-soon`은 확인된 연도가 있을 때만 예외적으로 노출한다.

## 공연 추가

1. `PERFORMANCE-WORKFLOW.md`에 따라 공연 데이터와 자산을 등록한다.
2. 공연 데이터에 지원되는 `homeHero.theme`과 `heroImage`를 연결하고 고유 Hero Scene을 구현한다.
3. `archiveMaterials`의 POSTER Viewer 이미지를 등록한다. 이 이미지를 카드에 재사용하므로 별도 중복 폴더는 만들지 않는다.
4. HOME 기본 선정, 카드 선택, 상세 링크, header theme을 확인한다.

## 앨범 추가

1. `ALBUM-WORKFLOW.md`에 따라 `albums.ts`와 실제 자산을 등록한다.
2. 확정 `releaseDate`, `coverImage`, 실제 `detailsPath`, 전용 Hero Scene을 준비한다. 단, `coming-soon`은 확정 연도와 나머지 실제 자산·경로가 모두 있으면 `releaseDate` 없이 노출할 수 있다.
3. PERFORMANCE와 같은 선택 인터페이스를 사용하되 타입은 `ALBUM`으로 표시한다. 존재하지 않는 상세 페이지나 임시 커버는 만들지 않는다.

## 앨범 Hero 운영 원칙

- 지영희류·한범수류 모두 `RECENT WORKS`의 `ALBUM` 카드, `AlbumHero`, 실제 `/album/:id` 상세에 연결되어 있다.
- 두 앨범은 `App.tsx`의 `JiYoungHeePersistentStage` / `HanBeomSuPersistentStage`가 배경과 3D Canvas를 담당한다. `AlbumHero` 내부의 공용 `AlbumPackage3D`는 이 두 ID에 사용하지 않는 일반 앨범용 경로다.
- `VIEW ALBUM`은 `autoOpenAlbum: true` 라우트 상태로 상세 진입 시 앨범을 열도록 요청한다. 직접 상세 URL 접근과 HOME에서 들어가는 흐름을 각각 검수한다.
- 실제 커버와 앨범 고유 디자인을 유지하고, Hero에는 앨범명·발매 상태/연도·트랙 수·상세 링크를 표시한다. 상세 트랙·크레딧·북클릿·플레이어는 상세 화면에 둔다.
- 지영희류는 밝은 배경과 oxblood accent, 한범수류는 dark teal 배경과 warm ivory/teal accent를 사용한다. 공연별 테마에 앨범 CSS가 영향을 주지 않도록 한다.
- 배경은 `albumHero.background`의 desktop/mobile WebP를 `<picture>`로 선택한다. `backgroundAnchor`는 원본 크기와 x 비율을 저장하며 화면의 cover crop을 고려해 3D 위치를 계산한다.
- 현재 지영희류 배경 anchor는 desktop/mobile 모두 x=0.5, 한범수류는 desktop x=0.43, mobile x=0.5다. desktop 원본 기준은 2560×1440, mobile은 1440×2560이며 데이터와 함께 갱신한다.
- 닫힌 패키지는 느린 자동 회전, click/drag 구분, 수동 yaw 연속 회전과 감쇠 관성을 지원한다. pointer 조작 후 자동 회전을 멈추며 `prefers-reduced-motion`에서 자동 회전하지 않는다. 열린 상태의 제한 drag와 닫힌 상태의 회전을 혼동하지 않는다.
- 3D 조명·그림자·인쇄 texture의 가독성과 패키지 비율은 실제 화면으로 검수한다. 과거 공용 Scene의 ±168° 제한, 22초 회전, 상대 축소율을 현재 persistent Scene의 고정 규격으로 사용하지 않는다.
- HOME에서 활성화된 앨범 Scene을 lazy-load한다. 상세의 NEXT ALBUM은 desktop에서 다음 앨범 모듈·일부 이미지를 미리 준비하므로 “항상 현재 앨범만 요청한다”는 보장은 하지 않는다.
- RECENT WORKS의 앨범 cover는 crop 없이 실제 이미지 비율을 사용하고, 제목은 공식 앨범명에서 제목/유파를 나눈다. 공연 카드의 비율·선택 동작은 유지한다.
- 날짜 없는 `coming-soon` 앨범은 RECENT WORKS 연도 정렬에 참여하지만 날짜 기반 기본 Hero 후보에서는 제외한다. 지정 ID 우선 규칙은 별도다.
- Three.js와 React Three Fiber의 DPR 제한, reduced-motion, 텍스처 지연 로딩을 유지한다. 실제 모바일 GPU·터치 성능은 별도 검수한다.

## 자산 위치

- 공연 Hero와 카드: `public/assets/performances/{performance-id}/web/`, `viewer/poster.webp`
- 앨범 Hero와 커버: `public/assets/albums/{album-id}/web/`
- 별도 `recent-works` 자산 저장소를 만들지 않는다. Viewer 포스터가 너무 무거워 별도 썸네일이 필요해질 때에는 각 도메인의 `web/recent-work-thumbnail.{ext}`를 권장 이름으로 사용하고 실제 바이너리는 사용자가 제공한다.

## 인터랙션과 접근성

- Desktop: 아무 카드도 탐색하지 않을 때 실제 Hero인 `activeIndex`를 강조한다. 카드 hover 또는 keyboard focus 중에는 별도 interaction index의 카드만 위로 꺼낸 듯 확대·상승하고, 기존 active 카드는 일반 상태로 돌아간다.
- Mobile: label tap으로 하단 가로 목록을 열고, native swipe/drag와 center scroll snap으로 탐색한다. 중앙에 가장 가까운 `previewIndex`만 시각적으로 강조하며 swipe만으로 `activeIndex`나 Hero를 변경하지 않는다. 카드를 tap한 경우에만 Hero를 선택한다.
- 앨범 카드의 이미지 박스는 강제 비율이나 crop 없이 실제 cover 이미지 비율을 그대로 사용한다. 공연 포스터 카드는 기존 세로 비율과 `cover` 표시를 그대로 유지하며, 앨범 카드도 공통 active·hover·focus·preview 상태 규칙을 따른다.
- 좌우 방향키, Home, End로 카드 포커스를 이동하고 ESC로 목록을 닫는다. 현재 카드는 `aria-selected`로 전달한다.
- 비활성 Hero는 `aria-hidden`과 `inert`로 포커스 및 접근성 트리에서 제외한다.
- `prefers-reduced-motion`에서는 fan, 큰 이동, crossfade transition을 제거하되 모든 선택 기능은 유지한다.

## 고유 Hero 보존 원칙

RECENT WORKS는 작품을 선택하는 계층일 뿐 각 작품의 디자인을 대체하지 않는다. 기존 Hero 컴포넌트, 배경, 타이포그래피, 상세 버튼과 등장 애니메이션을 유지하고, 선택 시 해당 컴포넌트를 그대로 활성화한다. 새 Work도 공통 카드 UI와 고유 Hero Scene을 분리한다.

## HOME Creative Credit와 모바일 Hero 배치

- HOME Hero에만 세로형 Creative Credit을 둔다. Desktop에서는 왼쪽 하단을 유지하고, 모든 HOME Hero의 Mobile에서는 safe area를 고려한 오른쪽 하단에 통일한다. 다른 페이지의 footer나 전역 watermark로 사용하지 않는다.
- 기본 서명은 `Soul`, 공식 문구는 `CREATIVE DIRECTION & DESIGN — Soul.P`, 개인 이스터에그 문구는 `사랑하는 소울과 하울의 아빠`이다.
- fine pointer 환경에서는 hover 또는 keyboard focus로 공식 문구를 연다. 공식 문구의 1.3초 reveal이 끝난 뒤 약 3초 동안 hover/focus가 계속된 경우(총 4.3초)에만 개인 문구를 표시하며, 영역을 벗어나면 timer와 열린 상태를 정리한다.
- touch 환경은 `CLOSED → CREDIT → PERSONAL`의 2단 tap을 사용한다. 첫 tap은 공식 문구까지만 열고, 열린 `Soul.P`를 다시 tap할 때만 개인 문구를 전환한다. 열린 상태에서 외부를 tap하면 전체를 닫는다.
- `Soul`은 하나의 DOM anchor로 유지하고 prefix와 `.P`의 reveal에 따라 최종 위치로 이동시킨다. 중복된 `Soul`의 opacity crossfade는 사용하지 않는다.
- Mobile에서도 기존 `rotate(-90deg)` 방향과 reveal animation을 그대로 유지한다. 오른쪽 배치는 위치 좌표만 전환하며 글자 방향을 뒤집거나 `writing-mode`로 재작성하지 않는다.
- 현재 `html[data-home-hero-theme]`에 맞춰 dark Hero에서는 읽을 수 있는 대비의 muted ivory, `sanjo-matiere`에서는 읽을 수 있는 muted navy/gray로 명시적으로 전환한다. 개인 문구도 발견 후 읽을 수 있는 대비를 확보하되 두 theme 모두 공식 문구보다 작은 크기와 낮은 대비를 유지한다.
- 초기 버튼은 keyboard focus가 가능하고 Enter/Space, ESC, `aria-expanded`를 지원한다. 개인 문구에는 불필요한 live announcement를 사용하지 않는다.
- 펼쳐진 credit block만 위로 이동해 viewport bottom에서 24px(모바일은 safe area 추가)의 breathing room을 확보하고, 닫힌 `Soul`은 기존 edge signature 위치에 유지한다. 위치 이동은 1.3초 reveal과 같은 easing으로 연결한다.
- `prefers-reduced-motion`에서는 reveal과 anchor 및 위치 이동을 사실상 즉시 전환하지만 desktop dwell과 mobile 2단 tap 조건은 유지한다.
- 모바일의 회전된 anchor는 보이는 `Soul`을 중심으로 실제 52×52px touch target과 `touch-action: manipulation`을 확보한다. hit area는 작은 오른쪽 가장자리 영역으로 제한하며 RECENT WORKS보다 낮은 stacking layer를 유지하고 해당 panel의 swipe, tap, focus 및 `activeIndex`/`previewIndex`/`interactionIndex`를 방해하지 않는다.

## Mobile Hero별 세로 배치

- `haegeum-recital`은 공연 정보 전체를 하나의 `.hero-content` block으로 유지하면서 eyebrow가 viewport 상단 약 25%에서 시작하도록 flex 정렬과 유동적인 top padding을 사용한다. 낮은 화면에서는 header 아래 최소 여백을 보장하고 큰 화면에서는 이동량을 제한한다.
- `sanjo-matiere`의 공연 정보와 오른쪽 text composition은 기존 Mobile 위치를 유지한다. 두 theme에 공통으로 적용되는 Mobile 변경은 Creative Credit의 오른쪽 하단 배치뿐이다.
- 공연 정보, Creative Credit, RECENT WORKS의 stacking과 hit area를 분리하여 RECENT WORKS trigger, panel, horizontal swipe, card tap 및 scroll snap을 방해하지 않는다.

## 과거 기록: 2020 한범수류 최초 활성화 (2026-08-15)

> 아래는 최초 활성화 당시의 크기·anchor·공용 Scene·미완료 항목 기록이다. 현재 구현 지시서가 아니며, 최신 배경과 persistent 상세는 위 운영 원칙 및 [ALBUM-WORKFLOW.md](./ALBUM-WORKFLOW.md)를 따른다. 현재 두 앨범의 상세는 구현되어 있고 ABOUT은 `profile.discography[0]` 한 항목을 소개한다.

- 한범수류 앨범은 실제 front/back/spine과 desktop 3840×2160, mobile 1440×2560 배경을 사용해 HOME Album Hero 및 RECENT WORKS에 활성화했다. CD label 경로도 앨범 데이터에 보관하지만 HOME Scene은 이를 로드하지 않는다.
- 앨범별 `backgroundAnchor`의 원본 크기와 x 비율을 이용해 `object-fit: cover` scale 및 crop offset 이후의 screen-space 위치를 계산한다. 지영희류의 기존 값은 desktop `1369 / 3840`, mobile `720 / 1440`; 한범수류는 desktop `0.43`, mobile `0.50`이다.
- 선택적 `packageGeometry`는 native front/back/spine 비율을 공용 `AlbumPackage3D`에 전달한다. 한범수류의 비정사각 artwork는 왜곡하지 않으며 지영희류는 기존 package geometry와 위치를 유지한다.
- 한범수류는 dark teal painterly 배경, warm ivory 전경, desaturated teal accent를 사용한다. active work ID를 HTML과 rotator data attribute에 반영해 GNB, Creative Credit, RECENT WORKS를 dark Hero에 맞추되 다른 Hero의 색을 바꾸지 않는다.
- mobile 레이아웃은 지영희류와 같은 상단 패키지/하단 정보 구조이고 자동 순환은 추가하지 않는다. 한범수류 최종 detail 경험과 ABOUT 반영은 후속 작업이다.

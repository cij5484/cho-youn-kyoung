# HOME Hero와 RECENT WORKS 운영 워크플로

- 마지막 확인 날짜: 2026-08-13

## 역할과 대표 Work 선정

HOME Hero는 현재 가장 가까운 주요 활동을 안정적으로 소개하고, `RECENT WORKS`는 이미 공개된 주요 활동의 고유 Hero Scene을 사용자가 다시 탐색하게 한다. 자동 순환은 사용하지 않는다. 서울 날짜 기준으로 아직 지나지 않은 Work 가운데 가장 가까운 날짜를 기본 Hero로 선택하고, 모두 지났다면 가장 최신 Work를 선택한다.

## 데이터 연결

- 공연 Source of Truth는 `src/data/performances.ts`, 앨범 Source of Truth는 `src/data/albums.ts`이다. 두 파일을 합치거나 내용을 복사하지 않는다.
- `src/data/homeHeroSlides.ts`는 HOME 전용 adapter이다. `homeHero`가 있고 POSTER Viewer 자산이 있는 공연을 RECENT WORKS 모델로 조합한다.
- 앨범은 커버, 확정 발매일, 실제 상세 경로, 전용 Hero Scene이 모두 생긴 뒤 같은 adapter에서 조합한다. 현재 자산이나 상세 화면이 없는 앨범은 노출하지 않는다.

## 공연 추가

1. `PERFORMANCE-WORKFLOW.md`에 따라 공연 데이터와 자산을 등록한다.
2. 공연 데이터에 지원되는 `homeHero.theme`과 `heroImage`를 연결하고 고유 Hero Scene을 구현한다.
3. `archiveMaterials`의 POSTER Viewer 이미지를 등록한다. 이 이미지를 카드에 재사용하므로 별도 중복 폴더는 만들지 않는다.
4. HOME 기본 선정, 카드 선택, 상세 링크, header theme을 확인한다.

## 앨범 추가

1. `ALBUM-WORKFLOW.md`에 따라 `albums.ts`와 실제 자산을 등록한다.
2. 확정 `releaseDate`, `coverImage`, 실제 `detailsPath`, 전용 Hero Scene이 준비된 뒤 HOME adapter 매핑을 추가한다.
3. PERFORMANCE와 같은 선택 인터페이스를 사용하되 타입은 `ALBUM`으로 표시한다. 존재하지 않는 상세 페이지나 임시 커버는 만들지 않는다.

## 앨범 Hero 운영 원칙

> **확정 운영 원칙 / 구현 미완료:** 앨범도 PERFORMANCE와 동일한 `RECENT WORKS` 선택 인터페이스를 사용하지만, 현재 adapter에는 준비된 앨범 slide가 없으며 실제 앨범 Hero Scene도 아직 구현되지 않았다.

- `workType`은 `ALBUM`으로 표시하고 공연 Hero를 재사용하지 않는 앨범 전용 Hero Scene을 사용한다.
- 실제 커버를 Hero의 핵심 시각 요소로 삼고 앨범 고유 디자인을 보존한다.
- 앨범명, 발매 상태 또는 연도, 간단한 트랙 정보와 실제 상세페이지로 가는 `VIEW ALBUM` 정도만 표시한다.
- 검증된 공식 스트리밍 링크가 생기면 필요에 따라 `LISTEN`을 추가할 수 있지만 임의 링크는 만들지 않는다.
- 상세 트랙 목록, Credits, 디지털 북클릿은 Hero에 넣지 않고 `/album/:id` 상세페이지에서 제공한다.
- 앨범 Scene 추가로 기존 공연 Hero의 선정, 디자인, 애니메이션 또는 선택 동작을 변경하지 않는다.

## 자산 위치

- 공연 Hero와 카드: `public/assets/performances/{performance-id}/web/`, `viewer/poster.png`
- 앨범 Hero와 커버: `public/assets/albums/{album-id}/web/`
- 별도 `recent-works` 자산 저장소를 만들지 않는다. Viewer 포스터가 너무 무거워 별도 썸네일이 필요해질 때에는 각 도메인의 `web/recent-work-thumbnail.{ext}`를 권장 이름으로 사용하고 실제 바이너리는 사용자가 제공한다.

## 인터랙션과 접근성

- Desktop: 아무 카드도 탐색하지 않을 때 실제 Hero인 `activeIndex`를 강조한다. 카드 hover 또는 keyboard focus 중에는 별도 interaction index의 카드만 위로 꺼낸 듯 확대·상승하고, 기존 active 카드는 일반 상태로 돌아간다.
- Mobile: label tap으로 하단 가로 목록을 열고, native swipe/drag와 center scroll snap으로 탐색한다. 중앙에 가장 가까운 `previewIndex`만 시각적으로 강조하며 swipe만으로 `activeIndex`나 Hero를 변경하지 않는다. 카드를 tap한 경우에만 Hero를 선택한다.
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

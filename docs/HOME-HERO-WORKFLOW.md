# HOME Hero와 RECENT WORKS 운영 워크플로

- 마지막 확인 날짜: 2026-08-08

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

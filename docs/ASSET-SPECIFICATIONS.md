# 에셋 규격과 파일 운영 기준

- 마지막 확인 날짜: 2026-08-10
- 기준 commit SHA: `83f14e2f8111ddc6cb4ec44bd424564e168a7e6e`

## 상태 구분

| 상태 | 의미 |
| --- | --- |
| 확정 규격 | 사용자 원본 또는 현재 프로젝트 기준으로 확정된 제작 규격 |
| 현재 저장소에서 확인된 실제 파일 규격 | 2026-07-24에 저장소 파일을 도구로 조사한 결과 |
| 권장 규격 | 다음 작업 때 따를 운영 권장안 |
| 미확정 규격 | 아직 실제 파일 또는 사용자 확인이 없어 단정하지 않는 항목 |

조사 도구: `file`, Python PNG/JPEG 헤더 파서, `pypdf`. `identify`, `pdfinfo`, `exiftool`은 환경에 설치되어 있지 않았습니다.

## A. 인쇄용과 웹용의 분리 원칙

- 인쇄용 원본과 Viewer용 이미지를 혼용하지 않습니다.
- 인쇄용 PDF는 다운로드용입니다.
- PNG는 브라우저 Viewer 미리보기용입니다.
- 웹 배경은 별도 제작합니다.
- 인쇄용 파일을 CSS 배경으로 사용하지 않습니다.
- 웹용 PNG를 인쇄 원본으로 사용하지 않습니다.

## B. B5 3단 리플렛 확정 규격

| 항목 | 확정 규격 |
| --- | --- |
| 완성 크기 | 552 × 258mm |
| 한 면 기준 | 184 × 258mm |
| 도련 | 사방 2mm |
| 도련 포함 전체 크기 | 556 × 262mm |
| 문서 마진 | 3mm |
| 세로 접지선 | 182mm, 367mm |
| 바깥면 | 왼쪽부터 1면 / 2면 / 3면 |
| 안쪽면 | 왼쪽부터 a면 / b면 / c면 |
| 해상도 | 300dpi |

기존의 3mm 도련 또는 다른 접지선 안내는 사용하지 않습니다.

### 인쇄용 리플렛

- 최종 PDF를 다운로드 파일로 사용합니다.
- 필요 시 TIFF/PNG를 별도 출력할 수 있습니다.
- 색공간은 실제 파일 확인 전 CMYK라고 단정하지 않습니다.
- PDF 검사: `python -m pip install --user pypdf pillow` 후 `pypdf.PdfReader`로 페이지 수와 `mediabox`를 확인합니다.

### 웹 Viewer용 리플렛

- 바깥면 PNG 1장, 안쪽면 PNG 1장을 사용합니다.
- Viewer 표시 순서는 OUTER → INNER입니다.
- RGB/sRGB 여부는 현재 도구로 확정하지 않았습니다.
- PDF 다운로드 파일은 별도입니다.

## C. A2 포스터

| 항목 | 상태 |
| --- | --- |
| 완성 크기 | 확정: 420 × 594mm |
| 도련값 | 미확정: 현재 프로젝트에서 사용하는 도련값은 실제 인쇄 파일과 기존 자료 확인 뒤 기록 |
| 해상도 | 확정: 300dpi |
| 분리 원칙 | 인쇄용 PDF와 Viewer용 PNG 분리 |
| PDF 색공간 | 미확정: 도구로 확인 가능한 경우만 작성 |

## D. 웹 Viewer·다운로드 자료 실제 규격

| 경로 | 형식 | 픽셀/페이지 크기 | 비율/페이지 수 | 용량 | 용도 |
| --- | --- | --- | --- | --- | --- |
| `public/assets/performances/haegeum-2026-08-02/viewer/poster.png` | PNG | 1414×2000px | 0.707:1 | 3.95 MB | 포스터 Viewer |
| `public/assets/performances/haegeum-2026-08-02/downloads/poster.pdf` | PDF | 1190.64×1683.84pt, 420.0×594.0mm | 1p | 19.90 MB | 포스터 다운로드 |
| `public/assets/performances/haegeum-2026-08-02/viewer/leaflet-outer.png` | PNG | 6520×3048px | 2.139:1 | 10.05 MB | 리플렛 OUTER Viewer |
| `public/assets/performances/haegeum-2026-08-02/viewer/leaflet-inner.png` | PNG | 6520×3048px | 2.139:1 | 1.98 MB | 리플렛 INNER Viewer |
| `public/assets/performances/haegeum-2026-08-02/downloads/leaflet.pdf` | PDF | 1576.14×742.86pt, 556.0×262.1mm | 2p | 16.72 MB | 리플렛 다운로드 |
| `public/assets/performances/sanjo-gil-2026-08-16/viewer/poster.png` | PNG | 1440×2036px | 0.707:1 | 5.19 MB | 포스터 Viewer |
| `public/assets/performances/sanjo-gil-2026-08-16/downloads/poster.pdf` | PDF | 1190.64×1683.84pt, 420.0×594.0mm | 1p | 11.95 MB | 포스터 다운로드 |
| `public/assets/performances/sanjo-gil-2026-08-16/viewer/leaflet-outer.png` | PNG | 2048×957px | 2.140:1 | 2.70 MB | 리플렛 OUTER Viewer |
| `public/assets/performances/sanjo-gil-2026-08-16/viewer/leaflet-inner.png` | PNG | 2048×957px | 2.140:1 | 3.32 MB | 리플렛 INNER Viewer |
| `public/assets/performances/sanjo-gil-2026-08-16/downloads/leaflet.pdf` | PDF | 1576.14×742.86pt, 556.0×262.1mm | 2p | 13.76 MB | 리플렛 다운로드 |

## E. 웹 배경 이미지 실제 규격

| 종류 | 경로 | 형식 | 픽셀 크기 | 비율 | 용량 |
| --- | --- | --- | --- | --- | --- |
| HOME Hero | `public/assets/performances/haegeum-2026-08-02/web/home-hero-desktop.png` | PNG | 1717×916px | 1.874:1 | 2.30 MB |
| HOME Hero | `public/assets/performances/sanjo-gil-2026-08-16/web/home-hero-desktop.png` | PNG | 1672×941px | 1.777:1 | 2.56 MB |
| 상세 Hero | `public/assets/performances/sanjo-gil-2026-08-16/web/detail-hero-desktop.png` | PNG | 2560×1200px | 2.133:1 | 4.60 MB |
| 모바일 Hero | `public/assets/performances/sanjo-gil-2026-08-16/web/detail-hero-mobile.png` | PNG | 941×1672px | 0.563:1 | 2.53 MB |
| Note/Information | `public/assets/performances/sanjo-gil-2026-08-16/web/note-info-desktop.png` | PNG | 2560×1400px | 1.829:1 | 4.24 MB |
| 모바일 Note/Information | `public/assets/performances/sanjo-gil-2026-08-16/web/note-info-mobile.png` | PNG | 941×1672px | 0.563:1 | 2.08 MB |
| Program 01 | `public/assets/performances/sanjo-gil-2026-08-16/web/program-01-desktop.png` | PNG | 2560×650px | 3.938:1 | 2.34 MB |
| Program 02 | `public/assets/performances/sanjo-gil-2026-08-16/web/program-02-desktop.png` | PNG | 2560×650px | 3.938:1 | 2.85 MB |
| 모바일 Program 02 | `public/assets/performances/sanjo-gil-2026-08-16/web/program-02-mobile.png` | PNG | 941×1672px | 0.563:1 | 2.50 MB |
| Guest Artists | `public/assets/performances/sanjo-gil-2026-08-16/web/guest-artists-desktop.png` | PNG | 2560×1100px | 2.327:1 | 3.66 MB |
| Archive Bottom | `public/assets/performances/sanjo-gil-2026-08-16/web/archive-bottom-desktop.png` | PNG | 2560×900px | 2.844:1 | 3.34 MB |

권장 원칙: desktop과 mobile을 구분하고, `background-size: cover` 사용 시 중요한 요소를 중앙 안전영역에 둡니다. 글자가 올라가는 영역은 시각적 여백을 확보합니다. 모바일은 세로 비율을 사용합니다. 현재 모바일 이미지 3장은 941×1672px로 약 9:16 비율임을 확인했습니다. 단, 이것을 고정 픽셀 규격으로 단정하지 않습니다.

### HOME Hero 초광폭 표시 원칙

- 일반 desktop에서는 기존 composition을 유지하기 위해 `cover`를 사용할 수 있다.
- 원본보다 현저히 넓은 viewport에서는 픽셀 너비가 아니라 viewport aspect ratio로 별도 대응한다. 현재 1672×941px 산조길 HOME Hero는 `min-aspect-ratio: 2/1`인 desktop에서 세로 전체를 보존하도록 left-center 정렬의 `contain` 성격으로 표시하고, 오른쪽 여백은 기존 beige CSS background와 gradient가 이어받는다.
- 원본 이미지를 viewport에 맞춰 비율이 달라지도록 stretch하지 않으며, 중요한 composition을 잘라내지 않기 위해 기존 자산과 CSS background extension을 함께 사용할 수 있다.
- 현재는 별도 ultrawide binary가 없으므로 기존 desktop 자산과 CSS로 대응한다. 향후 전용 ultrawide 자산을 제공받으면 실제 경로와 확인된 규격을 이 문서에 추가한다.

## F. 출연자 사진 실제 규격과 권장 원칙

| 경로 | 형식 | 픽셀 크기 | 비율 | 용량 |
| --- | --- | --- | --- | --- |
| `public/assets/people/eo-yoon-seok/portrait.jpg` | JPEG | 602×903px | 0.667:1 | 0.04 MB |
| `public/assets/people/jin-min-jin/portrait.jpg` | JPEG | 602×903px | 0.667:1 | 0.05 MB |
| `public/assets/people/yang-seung-hwan/portrait.jpg` | JPEG | 4437×6656px | 0.667:1 | 20.56 MB |
| `public/assets/people/yoon-seung-hwan/portrait.jpg` | JPEG | 602×903px | 0.667:1 | 0.05 MB |
| `public/assets/people/kim-na-young/portrait.jpg` | JPEG | 602×903px | 0.667:1 | 0.11 MB |
| `public/assets/people/lee-young-seop/portrait.jpg` | JPEG | 602×901px | 0.668:1 | 0.06 MB |

권장 원칙: 얼굴 중심의 세로형 또는 정방형에 가까운 원본을 사용하고 과도한 압축은 피합니다. 동일 인물은 기존 경로를 재사용할 수 있습니다. CSS `object-position`으로 크롭 조정이 가능하며, 사진을 공연 폴더로 반드시 복사해야 하는 것은 아닙니다. 재인코딩 없이 원본을 유지합니다.

### ABOUT 프로필 갤러리

- 대표 portrait와 기존 `profile-gallery-01.jpg`–`07.jpg`는 그대로 유지합니다.
- 사용자가 제공한 신규 full 이미지는 `profile-gallery-08.webp`–`34.webp`, 목록용 thumbnail은 별도 `profile-gallery-08-thumb.webp`–`34-thumb.webp`를 사용합니다.
- full 이미지는 선택된 큰 portrait에만 사용하고, thumbnail 목록에서는 대응하는 경량 `-thumb.webp`를 사용해 두 역할을 분리합니다.
- Codex는 갤러리 바이너리를 생성·복사·재인코딩하지 않고 사용자가 제공해 저장소에 존재하는 파일을 `src/data/profile.ts`에서 참조합니다.

## G. 파일명 규칙

- 영문 소문자 사용
- 공백 없이 하이픈 사용
- 날짜는 `YYYY-MM-DD`
- 역할이 드러나는 이름 사용
- `final`, `new`, `copy`, `(1)` 같은 임시 이름 금지
- 같은 용도의 파일명은 공연마다 동일 패턴 사용

## H. 바이너리 작업 규칙

- Codex가 이미지/PDF를 생성·복사·재인코딩하지 않습니다.
- 사용자가 직접 업로드합니다.
- 경로가 동일한 교체는 코드 변경이 불필요할 수 있습니다.
- PR에서 바이너리 추가·삭제·교체 여부를 별도 확인합니다.
- 삭제 전 런타임 참조와 최종본 승인을 확인하며, 승인된 중복본만 삭제합니다.
- 필요 시 blob SHA로 동일 파일 여부를 확인합니다.
- 문서 전용 PR에는 바이너리 변경 0건이어야 하며, 승인된 자산 정리 PR은 삭제 내역을 문서와 함께 기록합니다.

## I. RECENT WORKS 카드

- 현재 공연 카드는 각 공연의 `viewer/poster.png`, 앨범 카드는 실제 `web/cover.png`를 재사용하며 별도 공용 자산 폴더를 만들지 않습니다.
- 목록 성능을 위해 경량 파일이 필요해질 때 권장 경로는 공연·앨범 각각의 `web/recent-work-thumbnail.{ext}`입니다. 고정 픽셀·형식은 실제 제공 자산을 검수한 뒤 확정합니다.

## J. PRESS 자산

- 일반 기사 링크는 텍스트 데이터만 사용하며 이미지나 빈 폴더를 만들지 않습니다.
- 사용 허가된 대표 이미지나 공식 보도자료 등 실제 파일이 필요한 경우에만 `public/assets/press/{press-id}/`를 생성합니다.

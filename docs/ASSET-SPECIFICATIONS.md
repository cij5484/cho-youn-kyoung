# 에셋 규격과 파일 운영 기준

- 마지막 확인 날짜: 2026-07-24
- 기준 commit SHA: `8a574e10b82f`

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
| `public/images/performance/2026-08-02/archive/2026-08-02-poster.png` | PNG | 1414×2000px | 0.707:1 | 3.95 MB | 포스터 Viewer |
| `public/images/performance/2026-08-02/archive/2026-08-02-poster.pdf` | PDF | 1190.64×1683.84pt, 420.0×594.0mm | 1p | 19.90 MB | 포스터 다운로드 |
| `public/images/performance/2026-08-02/archive/2026-08-02-leaflet-outer.png` | PNG | 6520×3048px | 2.139:1 | 10.05 MB | 리플렛 OUTER Viewer |
| `public/images/performance/2026-08-02/archive/2026-08-02-leaflet-inner.png` | PNG | 6520×3048px | 2.139:1 | 1.98 MB | 리플렛 INNER Viewer |
| `public/images/performance/2026-08-02/archive/2026-08-02-leaflet.pdf` | PDF | 1576.14×742.86pt, 556.0×262.1mm | 2p | 16.72 MB | 리플렛 다운로드 |
| `public/images/performance/2026-08-16/archive/2026-08-16-poster.png` | PNG | 1440×2036px | 0.707:1 | 5.19 MB | 포스터 Viewer |
| `public/images/performance/2026-08-16/archive/2026-08-16-poster.pdf` | PDF | 1190.64×1683.84pt, 420.0×594.0mm | 1p | 11.95 MB | 포스터 다운로드 |
| `public/images/performance/2026-08-16/archive/2026-08-16-leaflet-outer.png` | PNG | 2048×957px | 2.140:1 | 2.70 MB | 리플렛 OUTER Viewer |
| `public/images/performance/2026-08-16/archive/2026-08-16-leaflet-inner.png` | PNG | 2048×957px | 2.140:1 | 3.32 MB | 리플렛 INNER Viewer |
| `public/images/performance/2026-08-16/archive/2026-08-16-leaflet.pdf` | PDF | 1576.14×742.86pt, 556.0×262.1mm | 2p | 13.76 MB | 리플렛 다운로드 |

## E. 웹 배경 이미지 실제 규격

| 종류 | 경로 | 형식 | 픽셀 크기 | 비율 | 용량 |
| --- | --- | --- | --- | --- | --- |
| HOME Hero | `public/images/performance/2026-08-02/home/hero-background.png` | PNG | 1717×916px | 1.874:1 | 2.30 MB |
| HOME Hero | `public/images/performance/2026-08-16/home/hero-background.png` | PNG | 1672×941px | 1.777:1 | 2.56 MB |
| 상세 Hero | `public/images/performance/2026-08-16/detail/hero-background.png` | PNG | 2560×1200px | 2.133:1 | 4.60 MB |
| 모바일 Hero | `public/images/performance/2026-08-16/detail/hero-background-mobile.png` | PNG | 941×1672px | 0.563:1 | 2.53 MB |
| Note/Information | `public/images/performance/2026-08-16/detail/note-info-background.png` | PNG | 2560×1400px | 1.829:1 | 4.24 MB |
| 모바일 Note/Information | `public/images/performance/2026-08-16/detail/note-info-background-mobile.png` | PNG | 941×1672px | 0.563:1 | 2.08 MB |
| Program 01 | `public/images/performance/2026-08-16/detail/program-01-background.png` | PNG | 2560×650px | 3.938:1 | 2.34 MB |
| Program 02 | `public/images/performance/2026-08-16/detail/program-02-background.png` | PNG | 2560×650px | 3.938:1 | 2.85 MB |
| 모바일 Program 02 | `public/images/performance/2026-08-16/detail/program-02-background-mobile.png` | PNG | 941×1672px | 0.563:1 | 2.50 MB |
| Guest Artists | `public/images/performance/2026-08-16/detail/guest-artists-background.png` | PNG | 2560×1100px | 2.327:1 | 3.66 MB |
| Archive Bottom | `public/images/performance/2026-08-16/detail/archive-bottom-background.png` | PNG | 2560×900px | 2.844:1 | 3.34 MB |

권장 원칙: desktop과 mobile을 구분하고, `background-size: cover` 사용 시 중요한 요소를 중앙 안전영역에 둡니다. 글자가 올라가는 영역은 시각적 여백을 확보합니다. 모바일은 세로 비율을 사용합니다. 현재 모바일 이미지 3장은 941×1672px로 약 9:16 비율임을 확인했습니다. 단, 이것을 고정 픽셀 규격으로 단정하지 않습니다.

## F. 출연자 사진 실제 규격과 권장 원칙

| 경로 | 형식 | 픽셀 크기 | 비율 | 용량 |
| --- | --- | --- | --- | --- |
| `public/images/performance/2026-08-02/performers/eo-yoon-seok.jpg` | JPEG | 602×903px | 0.667:1 | 0.04 MB |
| `public/images/performance/2026-08-02/performers/jin-min-jin.jpg` | JPEG | 602×903px | 0.667:1 | 0.05 MB |
| `public/images/performance/2026-08-02/performers/yang-seung-hwan.jpg` | JPEG | 4437×6656px | 0.667:1 | 20.56 MB |
| `public/images/performance/2026-08-02/performers/yoon-seung-hwan.jpg` | JPEG | 602×903px | 0.667:1 | 0.05 MB |
| `public/images/performance/2026-08-16/performers/kim-na-young.jpg` | JPEG | 602×903px | 0.667:1 | 0.11 MB |
| `public/images/performance/2026-08-16/performers/lee-young-seop.jpg` | JPEG | 602×901px | 0.668:1 | 0.06 MB |

권장 원칙: 얼굴 중심의 세로형 또는 정방형에 가까운 원본을 사용하고 과도한 압축은 피합니다. 동일 인물은 기존 경로를 재사용할 수 있습니다. CSS `object-position`으로 크롭 조정이 가능하며, 사진을 공연 폴더로 반드시 복사해야 하는 것은 아닙니다. 재인코딩 없이 원본을 유지합니다.

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
- 기존 파일을 실수로 삭제하지 않습니다.
- 필요 시 blob SHA로 동일 파일 여부를 확인합니다.
- 문서 작업 PR에는 바이너리 변경 0건이어야 합니다.

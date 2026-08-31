# 2026-08-16 루트 중복 자산 정밀 비교

> **과거 비교·처리 기록 — 현재 삭제 후보 목록 아님.** 아래 환경 오류·파일 해시·검수·승인·삭제 결과는 2026-07-25 조사 당시의 기록이다. 당시 PNG 사용본은 이후 WebP로 교체되었으므로 현재 존재 여부를 별도로 확인한다. 현재 운영 안내는 [ASSET-SPECIFICATIONS.md](./ASSET-SPECIFICATIONS.md), 후속 정리는 [ASSET-OPTIMIZATION-PLAN.md](./ASSET-OPTIMIZATION-PLAN.md)를 따른다.

## 1. 조사 범위와 재현 조건

- **조사 기준 main SHA:** `a0d38ef13d6f06055afdc2613ecf262708e8b2d0` (PR #49 병합 커밋)
- **조사 날짜:** 2026-07-25
- 원격 `main` 확인을 위해 `git fetch origin main`을 실행했으나 이 환경의 GitHub HTTPS 요청이 HTTP 403으로 거부되었다. 따라서 로컬에 제공된 `main` 상당 커밋이 요청된 PR #49 병합 SHA와 정확히 일치하고, `git merge-base --is-ancestor a0d38ef... HEAD`가 성공하는 것을 기준으로 조사했다.
- **도구:** Python 3.14.4, Pillow 12.3.0, NumPy 2.5.1, PyMuPDF 1.28.0(MuPDF 1.28.0), pypdf 6.14.2, `hashlib.sha256`, `git hash-object`, `rg`.
- PNG는 Pillow로 읽고 RGBA 배열로 메모리 안에서만 변환했다. PDF는 PyMuPDF로 200 dpi, RGB, 알파 없음, 흰 페이지 배경이라는 동일 조건에서 메모리 렌더했다. 원본과 렌더 결과를 저장하지 않았고 diff 이미지도 만들지 않았다.

## 2. 결론 요약

| 루트 파일 | 현재 사용본 | 바이트 | 내용 판정 | 런타임 | 권고 |
| --- | --- | --- | --- | --- | --- |
| `2026-08-16-poster.png` | `public/assets/performances/sanjo-gil-2026-08-16/viewer/poster.png` | 동일 | **1. 완전 동일** | 루트 0건; public 사용 | **삭제 가능 — 현재 사용본과 완전 동일** |
| `2026-08-16-poster.pdf` | `public/assets/performances/sanjo-gil-2026-08-16/downloads/poster.pdf` | 동일 | **1. 완전 동일** | 루트 0건; public 사용 | **삭제 가능 — 현재 사용본과 완전 동일** |
| `2026-08-16-leaflet-outer.png` | `public/assets/performances/sanjo-gil-2026-08-16/viewer/leaflet-outer.png` | 다름 | **3. 육안상 거의 같지만 실제 색상 또는 일부 픽셀 차이 존재** | 루트 0건; public 사용 | **사용자 육안 확인 필요 — 실제 이미지 차이 존재** |
| `2026-08-16-leaflet-inner.png` | `public/assets/performances/sanjo-gil-2026-08-16/viewer/leaflet-inner.png` | 다름 | **3. 육안상 거의 같지만 실제 색상 또는 일부 픽셀 차이 존재** | 루트 0건; public 사용 | **사용자 육안 확인 필요 — 실제 이미지 차이 존재** |
| `2026-08-16-leaflet.pdf` | `public/assets/performances/sanjo-gil-2026-08-16/downloads/leaflet.pdf` | 다름 | **3. 육안상 거의 같지만 실제 색상 또는 일부 픽셀 차이 존재** | 루트 0건; public 사용 | **사용자 육안 확인 필요 — 실제 페이지 차이 존재** |

이번 PR에서는 권고만 기록하며 다섯 루트 파일을 삭제·이동·교체하지 않는다. 특히 리플렛 세 파일은 수치로 확인되는 실제 차이가 있으므로 사용자 승인 전에는 삭제하지 않는다.

## 3. 파일 식별값

확장자와 실제 포맷은 각각 PNG 시그니처/Pillow 디코딩 및 `%PDF-1.6` 헤더/PyMuPDF·pypdf 파싱으로 일치함을 확인했다.

| 파일 | 크기(byte) | SHA-256 | Git blob SHA | 규격 |
| --- | ---: | --- | --- | --- |
| `2026-08-16-poster.png` | 5,443,288 | `93b67f5a98b8461aefbd15cba9dff603374f4e99bac1c696b2aeab6f8f418206` | `d497db846d590c09e8d5a385a6757fed7f340f9c` | PNG, 1440×2036, RGB 8-bit |
| `public/.../viewer/poster.png` | 5,443,288 | `93b67f5a98b8461aefbd15cba9dff603374f4e99bac1c696b2aeab6f8f418206` | `d497db846d590c09e8d5a385a6757fed7f340f9c` | PNG, 1440×2036, RGB 8-bit |
| `2026-08-16-poster.pdf` | 12,532,715 | `62c152f0c41f0434bc3e6983a3c60ff668506030b33992bdb4e4968c56cbe7ed` | `30ce3c897802d0e5595fdf25531433bfd9c87dc3` | PDF 1.6, 1쪽 |
| `public/.../downloads/poster.pdf` | 12,532,715 | `62c152f0c41f0434bc3e6983a3c60ff668506030b33992bdb4e4968c56cbe7ed` | `30ce3c897802d0e5595fdf25531433bfd9c87dc3` | PDF 1.6, 1쪽 |
| `2026-08-16-leaflet-outer.png` | 2,831,083 | `60e790e08492b9aefb54e68df0e3080447871b4cfb18fde951e9b5e847470382` | `a8ea203d7ddc7482ccd4cbbb8895cfbe43281e52` | PNG, 2048×957, RGB 8-bit |
| `public/.../viewer/leaflet-outer.png` | 2,831,207 | `7abef305a60c4eb478555b920799203ded21ad22176dfb98788d7f95f0c1f1de` | `5c455776d90304424fd464ff163fd38c4716e4df` | PNG, 2048×957, RGB 8-bit |
| `2026-08-16-leaflet-inner.png` | 3,475,316 | `9b2d5509a4833a33b36dc04e28faffb29a89a8bb5b584cc3ed230fec0e9a1852` | `8cf7b9db5ff8fb97f7fa83d17848f358ed63b67a` | PNG, 2048×957, RGB 8-bit |
| `public/.../viewer/leaflet-inner.png` | 3,479,528 | `14db74685547503257cb11777abbc096c7e65e000647a4bae5ec6f00cacc8956` | `555442ca80181107930d629c7161dba207d4651b` | PNG, 2048×957, RGB 8-bit |
| `2026-08-16-leaflet.pdf` | 14,416,464 | `13db2921384e03c2cd7b6f4cda8bc5bb310b9078ec5e230c23fb1f9934b84e98` | `e8d738932ff0c751d137ec8166b68989359b21f9` | PDF 1.6, 2쪽 |
| `public/.../downloads/leaflet.pdf` | 14,431,063 | `3daccdb33d4ba52bcf4a1621eb7d155cf229d023535bd011c8bb509e87d5cfef` | `02fd572b86c862dec875c91be1bfa71583b45bbf` | PDF 1.6, 2쪽 |

## 4. PNG 정밀 비교

### 공통 속성과 메타데이터

세 쌍 모두 RGB, 채널당 8-bit, 알파 채널 없음, 약 300 dpi(`pHYs` 11,811 px/m), `sRGB IEC61966-2.1` ICC 프로필 있음이다. PNG ancillary chunk는 XMP를 담은 `iTXt`, `iCCP`, `pHYs`이고 별도 `tEXt`/`zTXt`는 없다. 포스터 양쪽 XMP는 생성 `2026-07-24 17:36:33 +09:00`, 수정·메타데이터 `17:53:16`으로 동일하다. 리플렛은 생성 `2026-07-23 14:06:07 +09:00`으로 같지만 루트 outer/inner 수정은 각각 `2026-07-24 17:48:18/17:48:19`, public은 `19:25:22/19:25:23`이다. 모두 Affinity 3.2.3 제작 이력이 있다.

### 디코딩 픽셀 비교

bounding box는 Pillow 방식의 우측·하단 제외 좌표 `(left, top, right, bottom)`이다. 평균 절대 차이는 차이가 없는 픽셀까지 포함한 전체 이미지 기준이며 비교를 위해 두 입력을 메모리에서 RGBA로 통일했다.

| 쌍 | 다른 픽셀 / 전체 | 비율 | bounding box | 채널별 최대 차이 RGBA | 채널별 평균 절대 차이 RGBA | 알파 차이 |
| --- | ---: | ---: | --- | --- | --- | --- |
| poster | 0 / 2,931,840 | 0% | 없음 | 0, 0, 0, 0 | 0, 0, 0, 0 | 없음 |
| leaflet outer | 15,213 / 1,959,936 | 0.776199% | `(162, 238, 513, 776)` | 167, 162, 151, 0 | 0.534943, 0.508293, 0.474051, 0 | 없음 |
| leaflet inner | 44,872 / 1,959,936 | 2.289463% | `(142, 168, 1856, 790)` | 238, 213, 169, 0 | 2.041545, 1.689775, 1.323707, 0 | 없음 |

포스터는 원본 바이트까지 같으므로 완전 동일이다. 리플렛은 규격·모드가 같아 재표본화 없이 직접 비교했는데 국소 영역에서 큰 채널 차이가 검출됐다. 따라서 단순 압축/메타데이터 차이로 분류할 수 없으며, 문구가 달라졌다고 텍스트 인식만으로 단정하지 않고 판정 3과 육안 확인 권고를 적용한다.

## 5. PDF 구조와 페이지 비교

### 포스터 PDF

- 두 파일 모두 PDF 1.6/PDF/X-4, 1쪽, 회전 0°이다. MediaBox/CropBox/BleedBox/TrimBox/ArtBox가 모두 `[0, 0, 1190.64, 1683.84] pt`이다.
- 제목 `산조길`, Creator `Affinity 3.2.3`, Producer `PDFlib+PDI 10.0.0p1-i (Win32)`, 생성 `2026-07-24 18:05:49 +09:00`; 수정일은 비어 있다.
- 추출 텍스트는 없고, 페이지당 ICCBased 8-bit JPEG 1개(3176×4491, 추출 이미지 SHA-256 `d7d4a823...f2e81`)가 있다. 두 PDF 전체 바이트가 동일하므로 별도 렌더 비교는 생략했다.

### 리플렛 PDF 구조

- 두 파일 모두 PDF 1.6/PDF/X-4, 2쪽, 각 회전 0°이다. 모든 페이지의 MediaBox/CropBox/BleedBox/ArtBox는 `[0, 0, 1576.14, 742.859] pt`, TrimBox는 `[5.66929, 5.66929, 1570.47, 737.189] pt`이다.
- 제목 `산조길,둘`, Creator/Producer는 포스터와 같다. 루트 생성 시각은 `2026-07-24 18:03:47 +09:00`, public은 `19:24:27`; 수정일은 없다. 어느 쪽도 추출 가능한 텍스트가 없어 텍스트 차이는 없다.
- 각 페이지는 ICCBased 8-bit JPEG 1개(4203×1981)를 포함하고 벡터 drawing은 검출되지 않았다. 루트의 추출 이미지 크기는 6,057,154/7,951,551 byte, public은 6,057,013/7,966,290 byte이며 네 이미지 SHA-256은 모두 달라 실제 래스터가 다름을 구조적으로도 확인했다.

### 200 dpi 동일 조건 렌더 비교

각 페이지는 4379×2064 RGB로 렌더되었다. 같은 순서끼리의 결과는 다음과 같다.

| 비교 | 다른 픽셀 / 전체 | 비율 | bounding box | 최대 RGB 차이 | 평균 절대 RGB 차이 |
| --- | ---: | ---: | --- | --- | --- |
| root p1 ↔ public p1 | 93,433 / 9,038,256 | 1.033750% | `(358, 516, 1109, 1668)` | 167, 163, 153 | 0.510176, 0.499459, 0.475823 |
| root p2 ↔ public p2 | 302,732 / 9,038,256 | 3.349451% | `(316, 366, 3960, 1693)` | 233, 213, 173 | 2.018823, 1.755251, 1.402956 |

교차 비교는 root p1↔public p2가 99.977994%, root p2↔public p1이 99.978281% 달랐다. 같은 순서의 차이가 1.03%/3.35%인 것과 명확히 대비되므로 **페이지 순서는 동일하고 p1=outer, p2=inner**이다.

### PDF와 PNG 대응

PDF는 재단 여백을 포함하고 PNG와 종횡비가 달라 픽셀 완전 일치 검사는 성립하지 않는다. 대응 확인용으로 같은 렌더를 PNG의 2048×957에 Lanczos 축소했을 때 같은 쪽이 반대 쪽보다 평균 절대 차이가 크게 낮아 p1=outer, p2=inner를 재확인했다. 세트 평균 RGB 절대 차이는 root PDF↔root PNG **12.9644**, root PDF↔public PNG **13.1472**, public PDF↔root PNG **13.1457**, public PDF↔public PNG **12.9765**였다. 즉 각 PDF가 같은 시각에 생성된 자기 PNG 세트와 근소하지만 더 정확히 대응한다. 다만 리샘플링·재단 여백 때문에 이 수치는 PNG 자체의 직접 비교값이 아니며, 디자인 동일성을 증명하는 근거로 과대 해석하지 않는다.

## 6. 런타임 참조

`src/**/*.ts`, `src/**/*.tsx`, `src/**/*.css`, `index.html`, JS/JSON 설정·manifest·데이터를 `rg`로 재검색한 결과 루트 다섯 파일의 경로 참조는 **0건**이다. 문서에 남은 과거 경로는 제외했다. 현재 홈페이지는 `src/data/performances.ts`에서 다음 public 자산만 사용한다.

- poster viewer/download: `public/assets/performances/sanjo-gil-2026-08-16/viewer/poster.png`, `downloads/poster.pdf`
- leaflet viewer/download: `viewer/leaflet-outer.png`, `viewer/leaflet-inner.png`, `downloads/leaflet.pdf`

Vite에서는 `public/` 접두어를 URL에서 제외해 `assets/...`로 기록한다. 저장소 raw URL처럼 런타임 코드 밖에서 루트 파일을 직접 소비하는 외부 사용 여부는 로컬 저장소만으로 확인할 수 없다.

## 7. 최종 권고와 확인하지 못한 항목

- 포스터 PNG/PDF는 SHA-256, blob SHA, 크기, 바이트가 각각 완전 동일하므로 기술적으로 삭제 가능하다. 단, 실제 삭제는 별도 승인·PR 대상이다.
- 리플렛 outer/inner/PDF는 실제 픽셀/페이지 차이가 있으므로 **현재는 삭제 금지에 준해 보존하고 사용자 육안 확인**이 필요하다. public 세트가 더 늦게 생성되었고 홈페이지가 이를 사용한다는 사실은 확인했지만, 어느 디자인이 최종 승인본인지는 메타데이터만으로 판단하지 않았다.
- 확인하지 못함: 외부 raw URL 사용, 제작자의 승인 이력과 변경 의도, 눈으로 읽은 문구별 의미 차이, PDF 내부 JPEG의 원본 편집 파일. 따라서 리플렛을 판정 4(명백한 문구·레이아웃 변경)로 단정하지 않는다.

## 8. 최종 처리 결과

- 사용자가 현재 홈페이지에서 사용하는 `public/assets/performances/sanjo-gil-2026-08-16/` 세트를 최종본으로 승인했다.
- 삭제 직전 표준 파일 5개의 존재 여부, `src/data/performances.ts`의 표준 경로 사용, 루트본 런타임 참조 0건을 다시 확인했다.
- 표준 파일의 SHA-256은 위 3절에 기록한 PR #50 조사값과 모두 일치하여 예상치 못한 변경이 없었다.
- 루트 포스터 PNG/PDF와 리플렛 PNG/PDF 5개를 삭제했으며, 현재 홈페이지의 표준본은 이동·교체·재인코딩 없이 그대로 유지했다.
- 루트본은 런타임 참조가 없었으므로 삭제 후 홈페이지 런타임 영향은 없다. 최종 처리는 후속 PR에서 수행했다.

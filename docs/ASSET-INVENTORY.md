# 자산 전수 목록 (Asset Inventory)

- **조사 날짜:** 2026-07-25
- **기준 main commit SHA:** `908f821906bfe96d8d7061ee4f1809781cfed57c` (PR #48 병합 커밋)
- **조사한 총 자산 수:** **41개** (`git ls-files` 기준)
- **형식별 개수:** PNG 20, JPEG 14, PDF 6, SVG 1 (WebP/GIF/AVIF 0)
- **전체 자산 용량:** **197,453,165 bytes (188.31 MiB)**
- **조사 도구:** `git ls-files`, `rg`, Python 3, Pillow(이미지 디코딩·픽셀), pypdf(PDF 페이지/MediaBox), `hashlib`(SHA-256), `git hash-object`, `git log`
- **확인하지 못한 항목:** `file`/`identify`/`pdfinfo` 명령이 없어 MIME은 확장자와 Pillow/pypdf 실제 디코딩의 교차 확인으로 기록했다. PDF의 재단선·bleed·색공간, 이미지 ICC/EXIF의 제작 의도, 외부에서 직접 사용 중인 공개 URL, 시각적 동일성(육안/원본 대조)은 확인 불가이다.
- **판정 범위:** 참조 횟수는 배포/런타임 파일(`src`, `index.html`, manifest/설정)에서의 **직접 문자열 등장 수**이다. 문서의 예시·설명은 횟수에서 제외하되 비고와 별도 문제 목록에 반영했다. `assetUrl`, `BASE_URL`, 데이터 순회는 동적 소비 구조로 교차검토했다.

## A. 요약

| 항목 | 결과 |
| --- | ---: |
| 공연 자산 | 32개 (2026-08-02: 10, 2026-08-16 public: 17, 루트 산재본: 5) |
| 앨범 자산 | 0개 (`albums.ts`의 1개 앨범은 자산 경로 미지정) |
| 사람/프로필 자산 | 14개 (출연자 6, 조윤경 프로필/갤러리 8; 공연 수와 중복 집계 가능) |
| 공용 자산 | 1개 (favicon) |
| 사용 중 | 35개 |
| 공용 재사용 중 | 1개 |
| 미사용 추정 | 0개 |
| 판단 보류 | 5개 |
| 깨진 런타임 참조 | 0개 |
| 완전 중복 | 2그룹 / 4개 파일 |
| 유사 중복 의심 | 1그룹 / 6개 파일(2026-08-16 루트/public 리플렛 세트; 해시는 다름) |

> 분류 합계는 관점별 통계라 겹칠 수 있다. “미사용 추정”은 삭제 판정이 아니며 GitHub Pages 밖의 과거 공개 URL·수동 배포 여부는 확인하지 못했다.

## B. 전체 자산 목록

| 번호 | 현재 경로 | 형식 | 크기 | 픽셀/PDF 규격 | 비율/페이지 | SHA-256 | Git blob SHA | 분류 | 사용 상태 | 참조 횟수 | 참조 위치 | 비고 |
| ---: | --- | --- | ---: | --- | --- | --- | --- | --- | --- | ---: | --- | --- |
| 1 | `2026-08-16-leaflet-inner.png` | image/png | 3.31 MiB (3,475,316 B) | 2048×957px | 2.140:1 | `9b2d5509a4833a33b36dc04e28faffb29a89a8bb5b584cc3ed230fec0e9a1852` | `8cf7b9db5ff8fb97f7fa83d17848f358ed63b67a` | 공연/Viewer | 판단 보류 | 0 | 직접 참조 없음 | 루트 산재; public 동명/유사본 존재; last a663227 2026-07-24 |
| 2 | `2026-08-16-leaflet-outer.png` | image/png | 2.70 MiB (2,831,083 B) | 2048×957px | 2.140:1 | `60e790e08492b9aefb54e68df0e3080447871b4cfb18fde951e9b5e847470382` | `a8ea203d7ddc7482ccd4cbbb8895cfbe43281e52` | 공연/Viewer | 판단 보류 | 0 | 직접 참조 없음 | 루트 산재; public 동명/유사본 존재; last a663227 2026-07-24 |
| 3 | `2026-08-16-leaflet.pdf` | application/pdf | 13.75 MiB (14,416,464 B) | 1576.14×742.86pt | 2p | `13db2921384e03c2cd7b6f4cda8bc5bb310b9078ec5e230c23fb1f9934b84e98` | `e8d738932ff0c751d137ec8166b68989359b21f9` | 공연/다운로드 | 판단 보류 | 0 | 직접 참조 없음 | 루트 산재; public 동명/유사본 존재; last a663227 2026-07-24 |
| 4 | `2026-08-16-poster.pdf` | application/pdf | 11.95 MiB (12,532,715 B) | 1190.64×1683.84pt | 1p | `62c152f0c41f0434bc3e6983a3c60ff668506030b33992bdb4e4968c56cbe7ed` | `30ce3c897802d0e5595fdf25531433bfd9c87dc3` | 공연/다운로드 | 판단 보류 | 0 | 직접 참조 없음 | 루트 산재; public 동명/유사본 존재; last a663227 2026-07-24 |
| 5 | `2026-08-16-poster.png` | image/png | 5.19 MiB (5,443,288 B) | 1440×2036px | 0.707:1 | `93b67f5a98b8461aefbd15cba9dff603374f4e99bac1c696b2aeab6f8f418206` | `d497db846d590c09e8d5a385a6757fed7f340f9c` | 공연/Viewer | 판단 보류 | 0 | 직접 참조 없음 | 루트 산재; public 동명/유사본 존재; last a663227 2026-07-24 |
| 6 | `public/favicon.svg` | image/svg+xml | 0.00 MiB (293 B) | SVG viewBox 64×64 | 1.000:1 | `967817c239264ae3b826ea53e353cc76f8e312904570d39dab27e6eef9242f08` | `87dbbfbe128944c65a1a66bb468a879c1e0ac10e` | 공용/아이콘 | 사용 중 | 1 | `index.html:16` | last 58a2d90 2026-07-22 |
| 8 | `public/assets/performances/haegeum-2026-08-02/viewer/leaflet-inner.png` | image/png | 1.98 MiB (2,074,191 B) | 6520×3048px | 2.139:1 | `bb688d1f05ca8610c30a9e5013a1d8a37579478ce98fc9023cba6f4d74ab82c1` | `97551a86056701ca567111f35e90c31fa4224372` | 공연/Viewer | 사용 중 | 1 | `src/data/performances.ts:231` | last e9c2cec 2026-07-24 |
| 9 | `public/assets/performances/haegeum-2026-08-02/viewer/leaflet-outer.png` | image/png | 10.05 MiB (10,538,212 B) | 6520×3048px | 2.139:1 | `390504fca49c38a1ce6922c89b402d53482335c7170e1467b59de5ec90ac3799` | `57c72d603d1f4ef9f93689a74390e69e7acb9ce5` | 공연/Viewer | 사용 중 | 1 | `src/data/performances.ts:231` | last e9c2cec 2026-07-24 |
| 10 | `public/assets/performances/haegeum-2026-08-02/downloads/leaflet.pdf` | application/pdf | 16.72 MiB (17,534,571 B) | 1576.14×742.86pt | 2p | `13f457784995f960f9805b8f95273ede2aeae94045dae0c6a8a3b03264510d3b` | `8bb14595d7ce9f8e1925030de17c8339fe30c3a2` | 공연/다운로드 | 사용 중 | 1 | `src/data/performances.ts:232` | last e9c2cec 2026-07-24 |
| 11 | `public/assets/performances/haegeum-2026-08-02/downloads/poster.pdf` | application/pdf | 19.90 MiB (20,871,197 B) | 1190.64×1683.84pt | 1p | `fe1fe62ebea67b02fcbff5439268b2b3219711af6009359133b473f7c6eeb0d9` | `6dcf8a7a6e53a0ec80ec05be03d52cee35889af5` | 공연/다운로드 | 사용 중 | 1 | `src/data/performances.ts:225` | last e9c2cec 2026-07-24 |
| 12 | `public/assets/performances/haegeum-2026-08-02/viewer/poster.png` | image/png | 3.95 MiB (4,146,144 B) | 1414×2000px | 0.707:1 | `beb5b6edf5c1a97a9e653d8d34b5c9ca3739351e780b3cbda289e2b61a6c1464` | `2a1a7e111d5d20647b109ddaf30112e55d8c2468` | 공연/Viewer | 사용 중 | 3 | `index.html:11`<br>`src/data/performances.ts:224`<br>`src/data/site.ts:14` | last e9c2cec 2026-07-24 |
| 13 | `public/assets/performances/haegeum-2026-08-02/web/home-hero-desktop.png` | image/png | 2.30 MiB (2,409,711 B) | 1717×916px | 1.874:1 | `edf14e2fabd05ebbcdd4593394edca74d1f74091afa751bd481f201910af1551` | `5323dfa3939102a1103710134482b23c99a3c452` | 공연/HOME | 사용 중 | 1 | `src/data/performances.ts:184` | last e9c2cec 2026-07-24 |
| 14 | `public/images/performance/2026-08-02/performers/eo-yoon-seok.jpg` | image/jpeg | 0.04 MiB (40,955 B) | 602×903px | 0.667:1 | `32f2b492731e5bfd418098ffee85ef05a467a3c725c44f12b55dc2b4b1a6f2ae` | `02b44008f9a54224b95a09728cc5355eff1bf7aa` | 사람/프로필 | 사용 중 | 1 | `src/data/performances.ts:107` | last e9c2cec 2026-07-24 |
| 15 | `public/images/performance/2026-08-02/performers/jin-min-jin.jpg` | image/jpeg | 0.05 MiB (52,063 B) | 602×903px | 0.667:1 | `5f1184c17b989bacf90b8a46948d694f4e647172771ba4d3f3099748e28571c5` | `444727fb3d63f96d5e67473b9a1a0cc51187ec5c` | 사람/프로필 | 사용 중 | 1 | `src/data/performances.ts:98` | last e9c2cec 2026-07-24 |
| 16 | `public/assets/people/yang-seung-hwan/portrait.jpg` | image/jpeg | 20.56 MiB (21,556,652 B) | 4437×6656px | 0.667:1 | `b9dcd9233492a1b9e354dfce71c509f272c317dd58b88c0bf60d5b688a83b29a` | `76a4a9558fd4415de4a54ec6a21958a308a5ecea` | 사람/프로필 | 공용 재사용 중 | 2 | `src/data/performances.ts:114`<br>`src/data/performances.ts:166` | 두 공연에서 같은 사진 재사용; 20.56 MiB; last e9c2cec 2026-07-24 |
| 17 | `public/images/performance/2026-08-02/performers/yoon-seung-hwan.jpg` | image/jpeg | 0.05 MiB (57,039 B) | 602×903px | 0.667:1 | `765d1d19f632b8a379c1443e6d2ba53eed2a34e06a7a1766d5ddcf83f414ae68` | `86def0cf826e0642e41bfc28b98626d87965b9c1` | 사람/프로필 | 사용 중 | 1 | `src/data/performances.ts:89` | last e9c2cec 2026-07-24 |
| 18 | `public/assets/performances/sanjo-gil-2026-08-16/viewer/leaflet-inner.png` | image/png | 3.32 MiB (3,479,528 B) | 2048×957px | 2.140:1 | `14db74685547503257cb11777abbc096c7e65e000647a4bae5ec6f00cacc8956` | `555442ca80181107930d629c7161dba207d4651b` | 공연/Viewer | 사용 중 | 1 | `src/data/performances.ts:170` | last 3cbf5c3 2026-07-24 |
| 19 | `public/assets/performances/sanjo-gil-2026-08-16/viewer/leaflet-outer.png` | image/png | 2.70 MiB (2,831,207 B) | 2048×957px | 2.140:1 | `7abef305a60c4eb478555b920799203ded21ad22176dfb98788d7f95f0c1f1de` | `5c455776d90304424fd464ff163fd38c4716e4df` | 공연/Viewer | 사용 중 | 1 | `src/data/performances.ts:170` | last 3cbf5c3 2026-07-24 |
| 20 | `public/assets/performances/sanjo-gil-2026-08-16/downloads/leaflet.pdf` | application/pdf | 13.76 MiB (14,431,063 B) | 1576.14×742.86pt | 2p | `3daccdb33d4ba52bcf4a1621eb7d155cf229d023535bd011c8bb509e87d5cfef` | `02fd572b86c862dec875c91be1bfa71583b45bbf` | 공연/다운로드 | 사용 중 | 1 | `src/data/performances.ts:170` | last 3cbf5c3 2026-07-24 |
| 21 | `public/assets/performances/sanjo-gil-2026-08-16/downloads/poster.pdf` | application/pdf | 11.95 MiB (12,532,715 B) | 1190.64×1683.84pt | 1p | `62c152f0c41f0434bc3e6983a3c60ff668506030b33992bdb4e4968c56cbe7ed` | `30ce3c897802d0e5595fdf25531433bfd9c87dc3` | 공연/다운로드 | 사용 중 | 1 | `src/data/performances.ts:169` | last b232fee 2026-07-24 |
| 22 | `public/assets/performances/sanjo-gil-2026-08-16/viewer/poster.png` | image/png | 5.19 MiB (5,443,288 B) | 1440×2036px | 0.707:1 | `93b67f5a98b8461aefbd15cba9dff603374f4e99bac1c696b2aeab6f8f418206` | `d497db846d590c09e8d5a385a6757fed7f340f9c` | 공연/Viewer | 사용 중 | 1 | `src/data/performances.ts:169` | last b232fee 2026-07-24 |
| 23 | `public/assets/performances/sanjo-gil-2026-08-16/web/archive-bottom-desktop.png` | image/png | 3.34 MiB (3,506,722 B) | 2560×900px | 2.844:1 | `4d818720755dfc884260294eb2e150dbe42d344a599079a4e86c3402d9cf97dc` | `be4498b11963f2979c4b5e59bee7ed182dc0f658` | 공연/DETAIL | 사용 중 | 1 | `src/styles/sanjo-detail.css:159` | last d1d588e 2026-07-24 |
| 24 | `public/assets/performances/sanjo-gil-2026-08-16/web/guest-artists-desktop.png` | image/png | 3.66 MiB (3,832,622 B) | 2560×1100px | 2.327:1 | `d1bcb08c0ee03a1c62233ce57b092be6ffead83e612cf446e0777e4d0a86a53a` | `e7a0a01cb67fb4eb21004b88d06f0621da269c91` | 공연/DETAIL | 사용 중 | 1 | `src/styles/sanjo-detail.css:122` | last d1d588e 2026-07-24 |
| 25 | `public/assets/performances/sanjo-gil-2026-08-16/web/detail-hero-mobile.png` | image/png | 2.53 MiB (2,650,123 B) | 941×1672px | 0.563:1 | `7ca1a4b78db930a7a8751c19781d2bcc5a9d07d1c9612dd4bd6dff301e87d5c5` | `be4e04f05255c59ec5b1d8d59f01e9ccc7afc4a8` | 공연/DETAIL | 사용 중 | 1 | `src/styles/sanjo-detail.css:212` | last bc2b5fd 2026-07-24 |
| 26 | `public/assets/performances/sanjo-gil-2026-08-16/web/detail-hero-desktop.png` | image/png | 4.60 MiB (4,818,589 B) | 2560×1200px | 2.133:1 | `20685257f4e15aaf63c9e4b814a3601f7de7aa482954caf9c1f078d45389f450` | `16a4168c21c47d3949563f2742978723429e892e` | 공연/DETAIL | 사용 중 | 1 | `src/styles/sanjo-detail.css:27` | last d1d588e 2026-07-24 |
| 27 | `public/assets/performances/sanjo-gil-2026-08-16/web/note-info-mobile.png` | image/png | 2.08 MiB (2,182,713 B) | 941×1672px | 0.563:1 | `c8c07e331419b1ee94c3b8a319f3eac8a2a28f0df3d240cfe1fe4c9781f20040` | `f062f81f43befc376b5cee95d0d64af254ff78cb` | 공연/DETAIL | 사용 중 | 1 | `src/styles/sanjo-detail.css:217` | last bc2b5fd 2026-07-24 |
| 28 | `public/assets/performances/sanjo-gil-2026-08-16/web/note-info-desktop.png` | image/png | 4.24 MiB (4,445,258 B) | 2560×1400px | 1.829:1 | `1647d222edca77d67c60b8f1cb3edc853b4bf8dab8af985a55accfcc934b4ef4` | `e12b41a6844420dcdaf0b006a6adad234a64e664` | 공연/DETAIL | 사용 중 | 1 | `src/styles/sanjo-detail.css:62` | last d1d588e 2026-07-24 |
| 29 | `public/assets/performances/sanjo-gil-2026-08-16/web/program-01-desktop.png` | image/png | 2.34 MiB (2,453,035 B) | 2560×650px | 3.938:1 | `d8c7727155ef0d13516912b52a45a30bc924683df8fb82473bfe079502eed848` | `9f6b1f0248c5a1ecfaf758a263eec9b2828d7f05` | 공연/DETAIL | 사용 중 | 1 | `src/styles/sanjo-detail.css:105` | last d1d588e 2026-07-24 |
| 30 | `public/assets/performances/sanjo-gil-2026-08-16/web/program-02-mobile.png` | image/png | 2.50 MiB (2,623,573 B) | 941×1672px | 0.563:1 | `86a340012a46bf3cee443363fbf8daa30bc48d70c99b65036f82f8551de65c79` | `81b8d04df447388cd272d487975926352839347d` | 공연/DETAIL | 사용 중 | 1 | `src/styles/sanjo-detail.css:222` | last bc2b5fd 2026-07-24 |
| 31 | `public/assets/performances/sanjo-gil-2026-08-16/web/program-02-desktop.png` | image/png | 2.85 MiB (2,992,735 B) | 2560×650px | 3.938:1 | `201a7004dc002a1a88ebe092164936e7228934bd43fb1e2fe01b2147bed9c30f` | `bcf40e10599a89756eea550f67aa6190905ff074` | 공연/DETAIL | 사용 중 | 1 | `src/styles/sanjo-detail.css:107` | last d1d588e 2026-07-24 |
| 32 | `public/images/performance/2026-08-16/home/hero-background.png` | image/png | 2.56 MiB (2,680,457 B) | 1672×941px | 1.777:1 | `6af189a07939b94de32ede7097d28fcab908ee26ac7e543ec4e1b8295f57f172` | `ae5bc95157efb44d1e328ae4374e404f4f9da4d2` | 공연/HOME | 사용 중 | 1 | `src/data/performances.ts:131` | last e9c2cec 2026-07-24 |
| 33 | `public/assets/people/kim-na-young/portrait.jpg` | image/jpeg | 0.11 MiB (112,883 B) | 602×903px | 0.667:1 | `7a25750472c493549044a397de537be861ff6be5afa1b95014244740381b8051` | `945ec1b5c8e199476ab9e14ccbd3f738edb8d1e8` | 사람/프로필 | 사용 중 | 1 | `src/data/performances.ts:165` | last e9c2cec 2026-07-24 |
| 34 | `public/assets/people/lee-young-seop/portrait.jpg` | image/jpeg | 0.06 MiB (64,134 B) | 602×901px | 0.668:1 | `1cda658d8a91a5ed664c8dd3d483ee9037610a3704993b3dc51a08a0cb70c6a4` | `96f879fd0dcd74ddeb056477cc9d81b9a7720352` | 사람/프로필 | 사용 중 | 1 | `src/data/performances.ts:164` | last e9c2cec 2026-07-24 |
| 35 | `public/assets/artist/profile/portrait.jpg` | image/jpeg | 6.80 MiB (7,134,655 B) | 3889×5834px | 0.667:1 | `6f7a6e8354271fab5c0b792c556f42337ab69c7bfe3d061584cf6fc919587fb5` | `839869f11bf7b7c36fa1567d51a539a72e4aa23e` | 사람/프로필 | 사용 중 | 3 | `src/data/profile.ts:25`<br>`src/data/profile.ts:28`<br>`src/data/profile.ts:29` | 7.14 MiB 대형 프로필; last 7f6e882 2026-07-22 |
| 36 | `public/assets/artist/gallery/profile-gallery-01.jpg` | image/jpeg | 0.20 MiB (210,397 B) | 1067×1600px | 0.667:1 | `b44f5d8b351cf46637d57c804489a1c898439e097a28e453212e152dd42d17ed` | `697d51f935f8656e04c430697d8ac8668f405a15` | 사람/프로필 | 사용 중 | 2 | `src/data/profile.ts:36`<br>`src/data/profile.ts:37` | last 01e02b0 2026-07-22 |
| 37 | `public/assets/artist/gallery/profile-gallery-02.jpg` | image/jpeg | 0.23 MiB (238,427 B) | 1066×1600px | 0.666:1 | `3e9bdd6729adffa0c526b6dff49a0101b829d74a8c004c5cd07594d03010304c` | `650540efd263e9d47952303bac03a216c7b31efa` | 사람/프로필 | 사용 중 | 2 | `src/data/profile.ts:44`<br>`src/data/profile.ts:45` | last 01e02b0 2026-07-22 |
| 38 | `public/assets/artist/gallery/profile-gallery-03.jpg` | image/jpeg | 0.13 MiB (138,820 B) | 1067×1600px | 0.667:1 | `ee7a1ef00a46dd6a94b20b4244dc578aa4e5ca83ef399027dada9b621171d510` | `2295363071b51e0eed996f19032eee878b902714` | 사람/프로필 | 사용 중 | 2 | `src/data/profile.ts:52`<br>`src/data/profile.ts:53` | last 01e02b0 2026-07-22 |
| 39 | `public/assets/artist/gallery/profile-gallery-04.jpg` | image/jpeg | 0.17 MiB (175,777 B) | 1066×1600px | 0.666:1 | `471f1e66f9e7f394532c830d8b4f44b284311975e3906b1648caf82c8abcd9eb` | `517220c17c2332c80881e90292bf736252f40de6` | 사람/프로필 | 사용 중 | 2 | `src/data/profile.ts:60`<br>`src/data/profile.ts:61` | last 01e02b0 2026-07-22 |
| 40 | `public/assets/artist/gallery/profile-gallery-05.jpg` | image/jpeg | 0.19 MiB (194,642 B) | 1066×1600px | 0.666:1 | `398825d32d9332329c7ce1f8b3ba6ef43e77080eea57820742abbf984a4fe904` | `4fc45c7100280d4448e40aca310af00cd91d5f5d` | 사람/프로필 | 사용 중 | 2 | `src/data/profile.ts:68`<br>`src/data/profile.ts:69` | last 01e02b0 2026-07-22 |
| 41 | `public/assets/artist/gallery/profile-gallery-06.jpg` | image/jpeg | 0.13 MiB (134,626 B) | 1067×1600px | 0.667:1 | `cdeda631fb88819677e853bbbdfff169dc6752c5e64f0bdb57ae7d51a236f57d` | `db789e0457910fed660428e69e8a1464ade83056` | 사람/프로필 | 사용 중 | 2 | `src/data/profile.ts:76`<br>`src/data/profile.ts:77` | last 01e02b0 2026-07-22 |
| 42 | `public/assets/artist/gallery/profile-gallery-07.jpg` | image/jpeg | 0.16 MiB (165,282 B) | 1066×1600px | 0.666:1 | `f6c1291f46563e72165f4b23229bbd87ddc17d5f260e5292e08874bcde9a2e32` | `31e966af025f576f1e603943bc9b2ec516f4685d` | 사람/프로필 | 사용 중 | 2 | `src/data/profile.ts:84`<br>`src/data/profile.ts:85` | last 01e02b0 2026-07-22 |

## C. 공연별 목록

### `haegeum-2026-08-02` (현재 날짜 폴더 `2026-08-02`)

- **HOME:** #13.
- **DETAIL:** 전용 이미지 없음(일반 상세 UI/CSS 사용).
- **VIEWER:** #8, #9, #12.
- **DOWNLOAD:** #10, #11.
- **PERFORMERS:** #14–#17.
- **THUMBNAILS:** 전용 파일 없음; 포스터/Hero를 별도 썸네일 없이 소비한다.

### `sanjo-gil-2026-08-16` (현재 날짜 폴더 `2026-08-16`)

- **HOME:** #32.
- **DETAIL:** #23–#31(데스크톱 6, 모바일 3).
- **VIEWER:** #18, #19, #22.
- **DOWNLOAD:** #20, #21.
- **PERFORMERS:** #33, #34와 #16(다른 공연 폴더의 사진을 공용 재사용).
- **THUMBNAILS:** 전용 파일 없음.
- **기타:** #1–#5는 루트에 흩어진 같은 공연 자료. #4/#5는 public 사본과 완전 동일하고, #1–#3은 목적·규격은 같으나 해시가 다르다.

## D. 인물 사진

| person-id 추정 | 현재 사진 | 사용 공연/화면 | 재사용·공용화 판단 |
| --- | --- | --- | --- |
| `cho-youn-kyoung` | `public/assets/artist/profile/portrait.jpg`, `public/assets/artist/gallery/profile-gallery-01.jpg`–`07.jpg` | ABOUT; 데이터 등록은 대표+01–07 | 대표와 01–07은 전용 프로필 세트. 미등록 중복 파일 08/09는 승인에 따라 삭제 완료 |
| `yang-seung-hwan` | `public/assets/people/yang-seung-hwan/portrait.jpg` | 두 공연 상세 | 동일 파일을 두 공연이 직접 재사용; 공용 `people/` 후보 1개 |
| `yoon-seung-hwan`, `jin-min-jin`, `eo-yoon-seok` | 각 `2026-08-02/performers/*.jpg` | `haegeum-2026-08-02` | 현재는 공연 전용; 다른 공연 재사용 증거 없음 |
| `kim-na-young`, `lee-young-seop` | 각 `public/assets/people/{person-id}/portrait.jpg` | `sanjo-gil-2026-08-16` | 사람별 공용 경로로 이동 완료 |

## E. 깨진 참조

- **런타임:** 없음. 데이터, CSS, `index.html`의 내부 자산 문자열을 `public/` 파일과 대조했다.
- **문서 참조:** `docs/implementation-notes.md`의 HOME Hero 예시도 현재 8/2 공연의 표준 경로로 동기화했다.
- 경로 대소문자 불일치와 `new URL(..., import.meta.url)` 참조는 발견하지 못했다. `assetUrl()`/`BASE_URL`은 선행 슬래시를 제거해 public 상대경로를 동적으로 조립한다.

## F. 미사용 추정 및 판단 보류

| 파일 | 상태 | 근거와 동적 참조 가능성 |
| --- | --- | --- |
| 루트 `2026-08-16-*` 5개 (#1–#5) | 미사용 추정 | Vite `public/` 밖이고 런타임 직접 참조 없음. 문자열의 suffix가 public 경로와 같아 단순 검색은 오탐 가능. 과거 공개 URL/수동 배포는 확인 불가 |
| `profile-gallery-08.jpg`, `09.jpg` | 삭제 완료 | `profile.ts` 배열은 01–07까지만 순회하고 자동 탐색/glob이 없으며, 삭제 전 두 파일의 SHA-256 동일성과 런타임 참조 0건 확인 |

## G. 중복 파일

### SHA-256 완전 동일

1. #4 ↔ #21 (`2026-08-16-poster.pdf`).
2. #5 ↔ #22 (`2026-08-16-poster.png`).
3. 삭제 완료: `profile-gallery-08.jpg` ↔ `09.jpg`는 동일 SHA-256이었으며 현재 중복 통계에서 제외.

### 유사 중복 의심(해시 다름)

- #1/#18, #2/#19, #3/#20은 각각 같은 2026-08-16 리플렛 역할·규격·페이지 수를 가지지만 byte 크기와 SHA-256이 다르다. 육안 및 제작 원본 대조 전에는 동일 콘텐츠로 확정하지 않는다. 삭제/통합은 제안일 뿐 실행하지 않았다.

## H. 이름·구조 문제

| 현재 경로 | 문제 유형 | 영향/판정 |
| --- | --- | --- |
| 루트 `2026-08-16-*` | 공연별 폴더 밖 산재, public 사본과 중복/유사 | 미사용 추정이나 외부 보존 의도 확인 필요 |
| 기존 공연 날짜 폴더 | 일부 공연 전용 출연자와 8/16 HOME Hero가 남음 | 승인된 이동 범위 밖 파일은 그대로 보류 |
| 기존 `archive/` | 이전 전 Viewer PNG와 다운로드 PDF가 한 폴더 | 사용 중 자료는 `viewer/`와 `downloads/`로 분리 완료 |
| `*-background.png` | 인쇄/웹 역할 | 모두 웹 CSS/Hero용으로 확인; 인쇄용 PDF가 CSS 배경인 사례 없음 |
| `public/assets/people/yang-seung-hwan/portrait.jpg` | 공용화 완료; 대형(20.56 MiB) | 두 공연 재사용, 최적화는 별도 승인/별도 PR 필요 |
| `public/assets/artist/profile/portrait.jpg` | 대형(6.80 MiB) | 웹 프로필 최적화는 별도 승인/별도 PR 필요 |
| `profile-gallery-08.jpg`, `09.jpg` | 완전 중복, 미등록, 참조 0건 | 사용자 승인에 따라 삭제 완료 |
| 전체 | 공백·괄호·한글·대문자·임시표현(`final/new/copy/(1)/수정/최종`) | 해당 파일명 없음 |
| 전체 참조 | GitHub Pages 대소문자 위험 | 현재 직접 참조 불일치 없음 |

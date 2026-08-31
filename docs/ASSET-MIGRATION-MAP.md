# 자산 이동 실행표 (Asset Migration Map)

> **과거 실행 기록 — 재실행 지시서 아님.** 아래 경로·완료·승인 표시는 2026-07-25 작업 당시의 기록이다. 이후 WebP 전환으로 경로와 자산 구성이 달라졌으며 과거 승인으로 현재 파일을 이동·삭제하지 않는다. 현재 기준은 [ASSET-SPECIFICATIONS.md](./ASSET-SPECIFICATIONS.md), 후속 전환은 [ASSET-OPTIMIZATION-PLAN.md](./ASSET-OPTIMIZATION-PLAN.md)를 확인한다.

- **조사 날짜:** 2026-07-25
- **기준 main commit SHA:** `908f821906bfe96d8d7061ee4f1809781cfed57c` (PR #48 병합 커밋)
- 이 문서는 사용 중 자산 36개의 실제 이동과 승인된 미사용 자산 3개의 삭제 결과를 기록한다.
- 사용자가 `public/assets/` 세트를 최종본으로 확인한 뒤 루트의 2026-08-16 중복 자료 5개를 삭제했다. 추가 사용자 판단이 필요한 자산은 없다.

## A. 권장 최종 구조

```text
public/assets/
  brand/{logo,icons}/
  artist/
    profile/portrait.jpg
    gallery/profile-gallery-{01..07}.jpg
    press/  # 향후 공식 보도용 사진·프레스킷 전용
  people/{person-id}/portrait.jpg
  performances/{performance-id}/{web,viewer,downloads,thumbnails}/
  albums/{album-id}/{web,viewer,downloads,thumbnails}/
  shared/{placeholders,platform-icons}/
```

공연은 `performances.ts` ID(`haegeum-2026-08-02`, `sanjo-gil-2026-08-16`), 앨범은 `albums.ts` ID(`han-beom-su-haegeum-sanjo-2020`)를 쓴다. 현재 앨범 자산은 없으므로 빈 폴더를 만들지 않는다.

## B. 표준 파일명

- 실제 확인된 역할만 `web/home-hero-desktop.png`, `web/detail-hero-desktop.png`, `web/detail-hero-mobile.png`, `web/note-info-desktop.png`, `web/note-info-mobile.png`, `web/program-01-desktop.png`, `web/program-02-desktop.png`, `web/program-02-mobile.png`, `web/guest-artists-desktop.png`, `web/archive-bottom-desktop.png`로 이동했다.
- Viewer는 `viewer/poster.png`, `viewer/leaflet-outer.png`, `viewer/leaflet-inner.png`, 다운로드는 `downloads/poster.pdf`, `downloads/leaflet.pdf`로 분리한다.
- 인물은 `people/{person-id}/portrait.jpg`, 아티스트 대표는 `artist/profile/portrait.jpg`, 현재 ABOUT 갤러리는 `artist/gallery/profile-gallery-{01..07}.jpg`로 분리한다. `artist/press/`는 향후 공식 보도자료·언론 제공용 사진과 프레스킷만을 위한 별도 영역이며 현재 갤러리에는 적용하지 않는다.
- 존재하지 않는 모바일/썸네일/앨범 파일은 생성하지 않는다.

## C. 전체 이전표

| 번호 | 현재 경로 | 제안 경로 | 처리 제안 | 분류 | 근거 | 영향받는 코드·문서 | 위험도 | 사용자 판단 필요 |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `2026-08-16-leaflet-inner.png` | 표준 `public/assets/` 파일 유지 | 사용자 최종본 확인·루트본 삭제 완료 | 공연/Viewer | [정밀 비교](./ASSET-DUPLICATE-COMPARISON.md) 후 public본 승인 | 직접 참조 없음 | 없음 | 아니오 |
| 2 | `2026-08-16-leaflet-outer.png` | 표준 `public/assets/` 파일 유지 | 사용자 최종본 확인·루트본 삭제 완료 | 공연/Viewer | [정밀 비교](./ASSET-DUPLICATE-COMPARISON.md) 후 public본 승인 | 직접 참조 없음 | 없음 | 아니오 |
| 3 | `2026-08-16-leaflet.pdf` | 표준 `public/assets/` 파일 유지 | 사용자 최종본 확인·루트본 삭제 완료 | 공연/다운로드 | [정밀 비교](./ASSET-DUPLICATE-COMPARISON.md) 후 public본 승인 | 직접 참조 없음 | 없음 | 아니오 |
| 4 | `2026-08-16-poster.pdf` | 표준 `public/assets/` 파일 유지 | 사용자 최종본 확인·루트본 삭제 완료 | 공연/다운로드 | public 사용본과 바이트 완전 동일 | 직접 참조 없음 | 없음 | 아니오 |
| 5 | `2026-08-16-poster.png` | 표준 `public/assets/` 파일 유지 | 사용자 최종본 확인·루트본 삭제 완료 | 공연/Viewer | public 사용본과 바이트 완전 동일 | 직접 참조 없음 | 없음 | 아니오 |
| 6 | `public/favicon.svg` | `public/assets/brand/icons/favicon.svg` | 이동 완료 | 공용/아이콘 | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `index.html:16` | 낮음 | 아니오 |
| 8 | `public/images/performance/2026-08-02/archive/2026-08-02-leaflet-inner.png` | `public/assets/performances/haegeum-2026-08-02/viewer/leaflet-inner.png` | 이동 완료 | 공연/Viewer | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/data/performances.ts:231` | 높음 | 아니오 |
| 9 | `public/images/performance/2026-08-02/archive/2026-08-02-leaflet-outer.png` | `public/assets/performances/haegeum-2026-08-02/viewer/leaflet-outer.png` | 이동 완료 | 공연/Viewer | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/data/performances.ts:231` | 높음 | 아니오 |
| 10 | `public/images/performance/2026-08-02/archive/2026-08-02-leaflet.pdf` | `public/assets/performances/haegeum-2026-08-02/downloads/leaflet.pdf` | 이동 완료 | 공연/다운로드 | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/data/performances.ts:232` | 높음 | 아니오 |
| 11 | `public/images/performance/2026-08-02/archive/2026-08-02-poster.pdf` | `public/assets/performances/haegeum-2026-08-02/downloads/poster.pdf` | 이동 완료 | 공연/다운로드 | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/data/performances.ts:225` | 높음 | 아니오 |
| 12 | `public/images/performance/2026-08-02/archive/2026-08-02-poster.png` | `public/assets/performances/haegeum-2026-08-02/viewer/poster.png` | 이동 완료 | 공연/Viewer | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `index.html:11`<br>`src/data/performances.ts:224`<br>`src/data/site.ts:14` | 높음 | 아니오 |
| 13 | `public/images/performance/2026-08-02/home/hero-background.png` | `public/assets/performances/haegeum-2026-08-02/web/home-hero-desktop.png` | 이동 완료 | 공연/HOME | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/data/performances.ts:184` | 높음 | 아니오 |
| 14 | `public/images/performance/2026-08-02/performers/eo-yoon-seok.jpg` | `public/assets/people/eo-yoon-seok/portrait.jpg` | 이동 완료 | 사람/프로필 | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/data/performances.ts:107` | 중간 | 아니오 |
| 15 | `public/images/performance/2026-08-02/performers/jin-min-jin.jpg` | `public/assets/people/jin-min-jin/portrait.jpg` | 이동 완료 | 사람/프로필 | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/data/performances.ts:98` | 중간 | 아니오 |
| 16 | `public/images/performance/2026-08-02/performers/yang-seung-hwan.jpg` | `public/assets/people/yang-seung-hwan/portrait.jpg` | 공용화 완료 | 사람/프로필 | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/data/performances.ts:114`<br>`src/data/performances.ts:166` | 중간 | 예 |
| 17 | `public/images/performance/2026-08-02/performers/yoon-seung-hwan.jpg` | `public/assets/people/yoon-seung-hwan/portrait.jpg` | 이동 완료 | 사람/프로필 | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/data/performances.ts:89` | 중간 | 아니오 |
| 18 | `public/images/performance/2026-08-16/archive/2026-08-16-leaflet-inner.png` | `public/assets/performances/sanjo-gil-2026-08-16/viewer/leaflet-inner.png` | 이동 완료 | 공연/Viewer | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/data/performances.ts:170` | 높음 | 아니오 |
| 19 | `public/images/performance/2026-08-16/archive/2026-08-16-leaflet-outer.png` | `public/assets/performances/sanjo-gil-2026-08-16/viewer/leaflet-outer.png` | 이동 완료 | 공연/Viewer | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/data/performances.ts:170` | 높음 | 아니오 |
| 20 | `public/images/performance/2026-08-16/archive/2026-08-16-leaflet.pdf` | `public/assets/performances/sanjo-gil-2026-08-16/downloads/leaflet.pdf` | 이동 완료 | 공연/다운로드 | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/data/performances.ts:170` | 높음 | 아니오 |
| 21 | `public/images/performance/2026-08-16/archive/2026-08-16-poster.pdf` | `public/assets/performances/sanjo-gil-2026-08-16/downloads/poster.pdf` | 이동 완료 | 공연/다운로드 | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/data/performances.ts:169` | 높음 | 아니오 |
| 22 | `public/images/performance/2026-08-16/archive/2026-08-16-poster.png` | `public/assets/performances/sanjo-gil-2026-08-16/viewer/poster.png` | 이동 완료 | 공연/Viewer | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/data/performances.ts:169` | 높음 | 아니오 |
| 23 | `public/images/performance/2026-08-16/detail/archive-bottom-background.png` | `public/assets/performances/sanjo-gil-2026-08-16/web/archive-bottom-desktop.png` | 이동 완료 | 공연/DETAIL | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/styles/sanjo-detail.css:159` | 높음 | 아니오 |
| 24 | `public/images/performance/2026-08-16/detail/guest-artists-background.png` | `public/assets/performances/sanjo-gil-2026-08-16/web/guest-artists-desktop.png` | 이동 완료 | 공연/DETAIL | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/styles/sanjo-detail.css:122` | 높음 | 아니오 |
| 25 | `public/images/performance/2026-08-16/detail/hero-background-mobile.png` | `public/assets/performances/sanjo-gil-2026-08-16/web/detail-hero-mobile.png` | 이동 완료 | 공연/DETAIL | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/styles/sanjo-detail.css:212` | 높음 | 아니오 |
| 26 | `public/images/performance/2026-08-16/detail/hero-background.png` | `public/assets/performances/sanjo-gil-2026-08-16/web/detail-hero-desktop.png` | 이동 완료 | 공연/DETAIL | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/styles/sanjo-detail.css:27` | 높음 | 아니오 |
| 27 | `public/images/performance/2026-08-16/detail/note-info-background-mobile.png` | `public/assets/performances/sanjo-gil-2026-08-16/web/note-info-mobile.png` | 이동 완료 | 공연/DETAIL | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/styles/sanjo-detail.css:217` | 높음 | 아니오 |
| 28 | `public/images/performance/2026-08-16/detail/note-info-background.png` | `public/assets/performances/sanjo-gil-2026-08-16/web/note-info-desktop.png` | 이동 완료 | 공연/DETAIL | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/styles/sanjo-detail.css:62` | 높음 | 아니오 |
| 29 | `public/images/performance/2026-08-16/detail/program-01-background.png` | `public/assets/performances/sanjo-gil-2026-08-16/web/program-01-desktop.png` | 이동 완료 | 공연/DETAIL | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/styles/sanjo-detail.css:105` | 높음 | 아니오 |
| 30 | `public/images/performance/2026-08-16/detail/program-02-background-mobile.png` | `public/assets/performances/sanjo-gil-2026-08-16/web/program-02-mobile.png` | 이동 완료 | 공연/DETAIL | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/styles/sanjo-detail.css:222` | 높음 | 아니오 |
| 31 | `public/images/performance/2026-08-16/detail/program-02-background.png` | `public/assets/performances/sanjo-gil-2026-08-16/web/program-02-desktop.png` | 이동 완료 | 공연/DETAIL | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/styles/sanjo-detail.css:107` | 높음 | 아니오 |
| 32 | `public/images/performance/2026-08-16/home/hero-background.png` | `public/assets/performances/sanjo-gil-2026-08-16/web/home-hero-desktop.png` | 이동 완료 | 공연/HOME | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/data/performances.ts:131` | 높음 | 아니오 |
| 33 | `public/images/performance/2026-08-16/performers/kim-na-young.jpg` | `public/assets/people/kim-na-young/portrait.jpg` | 이동 완료 | 사람/프로필 | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/data/performances.ts:165` | 중간 | 아니오 |
| 34 | `public/images/performance/2026-08-16/performers/lee-young-seop.jpg` | `public/assets/people/lee-young-seop/portrait.jpg` | 이동 완료 | 사람/프로필 | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/data/performances.ts:164` | 중간 | 아니오 |
| 35 | `public/images/profile/cho-youn-kyoung-profile.jpg` | `public/assets/artist/profile/portrait.jpg` | 이동 완료 | 사람/프로필 | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/data/profile.ts:25`<br>`src/data/profile.ts:28`<br>`src/data/profile.ts:29` | 중간 | 아니오 |
| 36 | `public/images/profile/gallery/profile-gallery-01.jpg` | `public/assets/artist/gallery/profile-gallery-01.jpg` | 이동 완료 | 사람/프로필 | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/data/profile.ts:36`<br>`src/data/profile.ts:37` | 중간 | 아니오 |
| 37 | `public/images/profile/gallery/profile-gallery-02.jpg` | `public/assets/artist/gallery/profile-gallery-02.jpg` | 이동 완료 | 사람/프로필 | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/data/profile.ts:44`<br>`src/data/profile.ts:45` | 중간 | 아니오 |
| 38 | `public/images/profile/gallery/profile-gallery-03.jpg` | `public/assets/artist/gallery/profile-gallery-03.jpg` | 이동 완료 | 사람/프로필 | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/data/profile.ts:52`<br>`src/data/profile.ts:53` | 중간 | 아니오 |
| 39 | `public/images/profile/gallery/profile-gallery-04.jpg` | `public/assets/artist/gallery/profile-gallery-04.jpg` | 이동 완료 | 사람/프로필 | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/data/profile.ts:60`<br>`src/data/profile.ts:61` | 중간 | 아니오 |
| 40 | `public/images/profile/gallery/profile-gallery-05.jpg` | `public/assets/artist/gallery/profile-gallery-05.jpg` | 이동 완료 | 사람/프로필 | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/data/profile.ts:68`<br>`src/data/profile.ts:69` | 중간 | 아니오 |
| 41 | `public/images/profile/gallery/profile-gallery-06.jpg` | `public/assets/artist/gallery/profile-gallery-06.jpg` | 이동 완료 | 사람/프로필 | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/data/profile.ts:76`<br>`src/data/profile.ts:77` | 중간 | 아니오 |
| 42 | `public/images/profile/gallery/profile-gallery-07.jpg` | `public/assets/artist/gallery/profile-gallery-07.jpg` | 이동 완료 | 사람/프로필 | 현재 역할과 데이터 ID에 맞춘 표준 경로 | `src/data/profile.ts:84`<br>`src/data/profile.ts:85` | 중간 | 아니오 |

## D. 코드 경로 수정 완료 목록

| 파일 | 이전 참조 | 현재 참조 | 관련 자산 | 주의사항 |
| --- | --- | --- | --- | --- |
| `src/data/performances.ts` | `images/performance/{date}/...` | `assets/performances/{performance-id}/...`, `assets/people/...` | Hero, Viewer, PDF, 출연자 | `assetUrl()`과 `BASE_URL` 유지; 양승환은 두 공연 동시 갱신 |
| `src/data/profile.ts` | `images/profile/...` | `assets/artist/profile/...`, `assets/artist/gallery/...` | 대표/갤러리 | 배열의 `src`와 `thumbnail`을 모두 변경 완료; 08/09는 미등록·동일 SHA 확인 후 삭제 |
| `src/styles/sanjo-detail.css` | `/images/performance/2026-08-16/detail/...` | `/assets/performances/sanjo-gil-2026-08-16/web/...` | 상세 desktop/mobile 배경 | CSS 9개 URL과 media query 3개를 빠짐없이 대조 |
| `index.html` | `/favicon.svg`, OG poster 절대 URL | `/assets/brand/icons/favicon.svg`, 새 공개 poster URL | favicon/SEO | 도메인 절대 URL과 GitHub Pages base 경로를 별도 검증 |
| `src/data/site.ts` | 2026-08-02 poster 절대 URL | 새 공개 poster URL | SEO | `index.html`과 일치 확인 |
| `README.md`, `docs/*.md` | 기존 `public/images/...` 및 stale Hero 경로 | 승인된 새 경로 | 운영 문서 | 예시와 사실 참조 구분; Markdown 링크 검사 |
| `src/data/albums.ts` | 자산 경로 없음 | 변경 없음 | 앨범 | 실제 자산이 생기기 전 경로 생성 금지 |

TSX는 경로를 직접 소유하지 않고 데이터/CSS를 소비한다. `SafeImage`, Archive Viewer, HOME rotator의 fallback과 `import.meta.env.BASE_URL` 동작을 회귀 검증해야 한다.

## E. 공용 인물 사진 결과

- `yang-seung-hwan.jpg`는 두 공연이 같은 파일을 재사용하므로 `people/yang-seung-hwan/portrait.jpg`로 내용 변경 없이 이동했다. 파일 최적화는 별도 승인 사항이다.
- 나머지 출연자 5명도 `people/{person-id}/portrait.jpg` 표준 경로로 이동했다.
- 조윤경 대표 사진은 `artist/profile/portrait.jpg`, ABOUT 갤러리 01–07은 `artist/gallery/`로 이동했다. `artist/press/`는 향후 공식 보도용 자료에만 사용하며 08/09는 승인에 따라 삭제했다.

## F. 최종 삭제 결과

| 파일 | 미사용 근거 | 동적 검색 | 중복 | 공개 URL 가능성 | 위험도 | 사용자 판단 |
| --- | --- | --- | --- | --- | --- | --- |
| 루트 `2026-08-16-poster.pdf/png` | public 밖, 런타임 미참조 | glob/조합 없음 | public 파일과 바이트 완전 동일 | 사용자가 public본 승인 | 없음 | 루트본 삭제 완료 |
| 루트 `2026-08-16-leaflet.pdf/inner/outer.png` | public 밖, 런타임 미참조 | glob/조합 없음 | [정밀 비교](./ASSET-DUPLICATE-COMPARISON.md)에 차이 기록 | 사용자가 public본 승인 | 없음 | 루트본 삭제 완료 |
| `profile-gallery-08.jpg`, `09.jpg` | `profile.ts` 미등록 및 저장소 전체 런타임 참조 0건 | 자동 glob 없음 | 서로 SHA 동일 | 사용자 승인 | 없음 | 삭제 완료 |
| `hero-watercolor.png` | 현재 공연 Hero 데이터 및 런타임 참조 없음 | 자동 glob 없음 | 없음 | 사용자 승인 | 없음 | 삭제 완료 |

## G. 실제 이전 순서

1. 원격 main 최신화와 백업/공개 URL 사용 현황을 확인한다.
2. 승인된 폴더만 준비한다.
3. `git mv`로 내용 변경 없이 이동한다.
4. 이동 전후 SHA-256과 필요 시 Git blob 동일성을 확인한다.
5. 데이터·TSX(해당 시)·CSS·HTML·문서 경로를 수정한다.
6. 정적/동적 깨진 참조 자동 검사를 실행한다.
7. lint와 build를 실행한다.
8. 데스크톱·모바일 HOME/상세/ABOUT를 검수한다.
9. Viewer와 포스터·리플렛 PDF 열기/다운로드를 검수한다.
10. 기존 경로 잔존과 의도치 않은 바이너리 변경을 확인한다.
11. 배포 후 실제 URL, 대소문자, 기존 공개 URL 영향을 확인한다.

## H. 실행 PR 체크리스트

- [x] 바이너리 재인코딩 없음; 이동 전후 파일 크기/SHA-256 동일
- [x] 모든 이동이 Git rename으로 인식됨
- [x] 누락된 직접·동적 참조 없음
- [x] HOME 및 PERFORMANCE 목록/각 공연 상세 확인
- [x] ABOUT 프로필/갤러리 확인
- [x] Archive Viewer, poster/leaflet PDF 확인
- [x] 데스크톱·모바일 배경 확인
- [x] GitHub Pages base와 대소문자 경로 확인
- [x] SEO/manifest/favicon 및 기존 공개 URL 영향 확인
- [x] 문서 갱신, lint/build, 배포 URL 확인

**현재 보류 항목:** 없음. 앨범 경로는 실제 파일이 생길 때 적용한다.

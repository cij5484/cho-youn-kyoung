# 릴리스 체크리스트

- 마지막 확인 날짜: 2026-08-14

## 콘텐츠

- [ ] 원본 문서 대조
- [ ] 제목·부제
- [ ] 날짜·시간
- [ ] 장소·주소
- [ ] 공식 링크
- [ ] 곡명·유파명
- [ ] 출연자 이름·역할
- [ ] 약력·대회명·수상명
- [ ] 사회자
- [ ] 티켓·좌석·연령
- [ ] 연주자의 말
- [ ] 프로그램 해설

## 파일

- [ ] 사용 중인 Hero, Viewer/PDF, 프로필·갤러리, 출연자 사진, favicon이 `public/assets/` 표준 경로를 사용하고 `public/images/`에는 런타임 자산이 없음
- [ ] 이동한 바이너리의 전후 SHA-256 동일 및 Git rename 인식
- [ ] 경로와 파일명
- [ ] 포스터 PNG
- [ ] 포스터 PDF
- [ ] 리플렛 OUTER
- [ ] 리플렛 INNER
- [ ] 리플렛 PDF
- [ ] 출연자 사진
- [ ] 데스크톱 배경
- [ ] 모바일 배경
- [ ] 바이너리 변경 내역
- [ ] 중복 자산 삭제 전 표준본 존재·SHA-256·런타임 참조·사용자 승인 확인
- [ ] 삭제 후 판단 보류·미사용 추정·깨진 런타임 참조 0건 확인

## 화면

- [ ] PC 1440px 이상
- [ ] 1180px 전후
- [ ] 태블릿
- [ ] 모바일 390px
- [ ] 모바일 360px
- [ ] 모바일 320px
- [ ] 가로 스크롤 없음
- [ ] 글자 잘림 없음
- [ ] 배경과 글자 대비
- [ ] 긴 본문
- [ ] 카드 열 수
- [ ] 프로필 패널
- [ ] 키보드·ESC·포커스
- [ ] HOME이 자동 순환하지 않고 사용자가 RECENT WORKS 카드 선택으로만 Hero를 변경함
- [ ] RECENT WORKS의 desktop hover/focus와 mobile swipe preview가 선택 전 Hero를 변경하지 않음
- [ ] RECENT WORKS keyboard 선택·ESC·포커스 및 reduced-motion 동작
- [ ] Album Hero canvas의 mouse/touch 제한 drag, reduced-motion, WebGL fallback 및 RECENT WORKS hit area 비간섭
- [ ] Album Hero를 포함해 390px·360px·320px 가로 스크롤 없음
- [ ] 모바일 메뉴 ESC·경로 변경 자동 닫기·스크롤 잠금·포커스 복원
- [ ] reduced motion
- [ ] MEDIA PC·태블릿 및 390px·360px·320px 독립 1열 반응형
- [ ] MEDIA 가로 스크롤 없음과 긴 제목 줄바꿈
- [ ] MEDIA 키보드 접근, focus-visible, 최소 터치 영역과 reduced motion

## 기능

- [ ] `/sitemap.xml` HTTP 200 확인
- [ ] `/robots.txt` HTTP 200 확인
- [ ] `sitemap.xml`이 XML 문서로 반환되는지 확인
- [ ] `robots.txt`가 일반 텍스트로 반환되는지 확인
- [ ] `sitemap.xml`의 `loc`가 `https://choyounkyoung.com/` 하나만 포함하는지 확인
- [ ] `robots.txt`의 `Sitemap` 주소가 공식 도메인과 일치하는지 확인
- [ ] 공연 목록 정렬
- [ ] ABOUT 정렬
- [ ] 이전·다음 공연
- [ ] Viewer 전체화면
- [ ] 헤더 가림 없음
- [ ] Viewer 스크롤
- [ ] 포스터 보기
- [ ] 리플렛 OUTER/INNER
- [ ] PDF 다운로드
- [ ] 외부 링크
- [ ] 이미지 fallback
- [ ] 존재하지 않는 경로의 404 안내와 HOME·PERFORMANCE 링크
- [ ] HOME 기본 Work 선정과 RECENT WORKS 카드 선택 및 상세 링크
- [ ] 공연 상세 아래쪽 출연자 카드 이미지 lazy loading
- [ ] `#/media` 직접 접근과 PC·모바일 메뉴 MEDIA 활성 상태
- [ ] 모바일 메뉴에서 MEDIA 이동 후 자동 닫힘
- [ ] YouTube preview에서 재생 전 iframe 미생성, 재생 후 해당 iframe만 생성
- [ ] `youtube-nocookie.com` privacy-enhanced embed와 고유 iframe title
- [ ] 일반 영상 및 VR·360° 영상 재생
- [ ] 앨범 전체 재생목록 외부 링크
- [ ] YouTube 썸네일 fallback 및 앨범 `coverImage` 유무에 따른 커버·텍스트 단일 열 표시
- [ ] MEDIA 외부 링크의 새 탭 및 보안 속성

## 앨범 상세 및 향후 기능

- [ ] `/album/:id`가 `albums.ts`의 앨범을 표시하고 없는 ID는 공통 404로 안전하게 처리
- [ ] 선택 데이터가 없는 상세 섹션은 렌더링하지 않고 WORKS의 `detailsPath` 없는 앨범 동작 유지

> 지영희류 HOME Album Hero의 실제 데이터·texture·노출은 활성화되었습니다. 실제 발매일과 스트리밍 링크는 아직 없으며 재생기와 북클릿은 향후 PR의 **미확정 체크리스트**입니다.
- [x] 실제 공개 전 면별 공식 texture와 앨범 데이터 연결 확인(임시 artwork 및 binary 금지)
- [x] RECENT WORKS에서 `ALBUM` 선택 시 전용 Hero Scene과 실제 `VIEW ALBUM` 링크 표시
- [ ] 앨범 Hero에는 앨범명·상태/연도·간단한 트랙 정보만 표시하고 상세 트랙·Credits·북클릿은 상세로 분리
- [ ] 트랙 선택, 재생·일시정지와 현재 트랙 상태 동기화
- [ ] CD가 재생 중 자연스럽게 회전하고 일시정지 시 자연스럽게 멈춤
- [ ] `prefers-reduced-motion`에서 CD 회전 등 비필수 motion 축소·제거
- [ ] 디지털 북클릿 Desktop 펼침면과 keyboard 조작, Mobile touch/swipe
- [ ] 디지털 북클릿 Viewer와 PDF 다운로드 역할 분리
- [ ] 외부 웹 음원 URL의 만료·404·CORS·네트워크 오류 시 안전한 fallback과 오류 안내
- [ ] 공식 플랫폼 링크와 자체 웹 재생 URL이 구분되고 임의 URL이 없음

## 개발

- [ ] 변경 범위 확인
- [ ] 기존 공연 회귀 확인
- [ ] 새 `!important` 없음
- [ ] 임시 override 없음
- [ ] 바이너리 오류 없음
- [ ] `npm install --no-audit --no-fund`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `git diff --check`
- [ ] GitHub Actions 성공
- [ ] 실제 배포 URL 확인
- [ ] 모바일 실기기 확인

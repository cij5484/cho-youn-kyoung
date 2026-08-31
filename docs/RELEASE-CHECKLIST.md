# 릴리스 체크리스트

- 코드 대조 날짜: 2026-08-31 (`41d082b`)

이 문서는 매 릴리스에서 새로 확인할 템플릿이다. 체크되지 않은 항목은 미구현을 뜻하지 않으며, 과거 구현·검수 완료 여부를 이번 릴리스의 통과 표시로 옮기지 않는다. 문서 전용 변경은 Markdown 범위·링크·코드 설명 대조를 확인하고 실행하지 않은 빌드·화면 검수는 별도로 명시한다.

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
- [ ] 바이너리를 재인코딩 없이 이동한 작업이라면 전후 SHA-256 동일 및 Git rename 인식 확인
- [ ] 경로와 파일명
- [ ] 포스터 Viewer WebP
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
- [ ] 두 Album Hero의 실제 desktop/mobile WebP 배경 선택과 공식 한글 제목/유파 표시
- [ ] persistent Canvas의 package interaction 영역, 닫힌 상태의 연속 yaw drag·관성, 열린 상태의 제한 drag, 영역 밖 pointer 해제 및 WebGL 오류 상황
- [ ] 닫힌 Album Hero 자동 회전, 첫 pointer 조작 시 중단 및 `prefers-reduced-motion` 자동 회전 제외
- [ ] Album Hero full-stage canvas에서 회전에 반응하는 부드러운 동적 그림자와 receiver/canvas 경계 미노출
- [ ] 두 Album Hero의 viewport별 패키지 크기·anchor, 연속된 배경, 잘리지 않는 정보·그림자 확인
- [ ] Album Hero texture 선명도, 실제 spine 비율과 절제된 muted oxblood accent, 오른쪽 위 광원과 그림자 방향 정합성 확인
- [ ] package-first/info-delayed 진입과 reduced-motion 즉시 표시, `VIEW ALBUM` underline·화살표 interaction 확인
- [ ] album-package HOME GNB desktop/mobile active·hover·focus oxblood accent와 8/16 navy 분리 확인
- [ ] RECENT WORKS 앨범의 `조윤경 해금산조` / `지영희류` 표기 및 공연 카드 fallback 확인
- [ ] WORKS 지영희류 row의 oxblood hover/focus와 기존 공연 gold/blue 회귀 없음
- [ ] 무광 종이 front/back/spine이 안쪽 반투명 plastic tray보다 조금 돌출되는 실제 디지팩 구조
- [ ] RECENT WORKS 앨범 카드가 crop 없이 실제 cover 이미지 비율로 표시되고 비활성·hover·focus·active 상태 및 공연 포스터 비율에 회귀 없음
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
- [ ] 존재하지 않는 경로의 404 안내와 HOME·WORKS 링크
- [ ] HOME 지정 ID 우선 선정과 지정 ID 부재 시 날짜 fallback, RECENT WORKS 카드 선택 및 상세 링크
- [ ] 공연 상세 아래쪽 출연자 카드 이미지 lazy loading
- [ ] `#/media` 직접 접근과 PC·모바일 메뉴 MEDIA 활성 상태
- [ ] 모바일 메뉴에서 MEDIA 이동 후 자동 닫힘
- [ ] YouTube preview에서 재생 전 iframe 미생성, 재생 후 해당 iframe만 생성
- [ ] `youtube-nocookie.com` privacy-enhanced embed와 고유 iframe title
- [ ] 일반 영상 및 VR·360° 영상 재생
- [ ] 앨범 전체 재생목록 외부 링크
- [ ] YouTube 썸네일 fallback, ABOUT 대표 앨범의 `coverImage` 유무 표시, WORKS 앨범 텍스트 행의 상세/외부 링크 분기
- [ ] MEDIA 외부 링크의 새 탭 및 보안 속성

## 현재 앨범 상세·재생·북클릿

- [ ] `/album/:id`가 `albums.ts`의 앨범을 표시하고 없는 ID는 공통 404로 안전하게 처리
- [ ] 선택 데이터가 없는 상세 섹션은 렌더링하지 않고 WORKS의 `detailsPath` 없는 앨범 동작 유지

> 두 앨범의 persistent 상세·R2 플레이어·북클릿은 구현되어 있다. 지영희류의 정확한 발매일·공식 플랫폼 링크와 두 앨범의 북클릿 PDF URL은 미등록이다. 아래는 이번 릴리스에서 다시 검수할 항목이며 실제 파일·URL이 없는 기능을 완료 처리하지 않는다.

- [ ] 면별 공식 texture와 앨범 데이터 연결 확인(임시 artwork 및 승인 없는 binary 변경 금지)
- [ ] RECENT WORKS에서 두 `ALBUM` 선택 시 전용 Hero Scene과 실제 `VIEW ALBUM` 링크 표시
- [ ] HOME→DETAIL·DETAIL→HOME의 persistent stage 유지와 직접 상세 접근, 두 앨범 사이 NEXT ALBUM 전환
- [ ] 앨범 Hero에는 앨범명·상태/연도·간단한 트랙 정보만 표시하고 상세 트랙·Credits·북클릿은 상세로 분리
- [ ] 두 앨범 각 6개 트랙의 실제 소리, 선택, 재생·일시정지, seek, volume과 현재 트랙 상태 동기화. 무음 미리보기 시계를 재생 성공으로 오인하지 않음
- [ ] PLAYER_FOCUS의 느린 idle CD 회전, 재생 중 속도 증가, focus 이탈 후 정지 및 BACK TO ALBUM 복귀
- [ ] PLAYER_FOCUS의 package 숨김과 앨범 복귀 시 재표시
- [ ] `prefers-reduced-motion`에서 CD 회전 등 비필수 motion 축소·제거
- [ ] 지영희류 P1~P7 / 한범수류 P1~P11의 순서·마지막 페이지, Desktop 펼침면과 keyboard 조작, Mobile touch/swipe·READ PAGE
- [ ] 디지털 북클릿 Viewer와 PDF 다운로드 역할 분리. PDF는 실제 URL이 등록된 경우에만 검수하며 현재 두 앨범은 미등록
- [ ] 외부 웹 음원 URL의 만료·404·CORS·네트워크 오류 시 안전한 fallback과 오류 안내
- [ ] 공식 플랫폼 링크와 자체 웹 재생 URL이 구분되고 임의 URL이 없음
- [ ] 다음 앨범 선로딩의 네트워크 요청과 실패·재시도·전환 대기 상태 확인

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

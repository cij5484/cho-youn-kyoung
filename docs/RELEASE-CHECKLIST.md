# 릴리스 체크리스트

- 마지막 확인 날짜: 2026-07-27
- 작업 기준 main SHA: `01b57156d81e`

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
- [ ] HOME 자동 전환 PAUSE/PLAY 버튼이 작은 화면에서도 잘리지 않음
- [ ] reduced-motion에서 HOME 자동 전환 중지
- [ ] 모바일 메뉴 ESC·경로 변경 자동 닫기·스크롤 잠금·포커스 복원
- [ ] reduced motion
- [ ] MEDIA PC·태블릿 및 390px·360px·320px 독립 1열 반응형
- [ ] MEDIA 가로 스크롤 없음과 긴 제목 줄바꿈
- [ ] MEDIA 키보드 접근, focus-visible, 최소 터치 영역과 reduced motion

## 기능

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
- [ ] HOME 자동 전환 PAUSE/PLAY와 수동 점·스와이프
- [ ] 공연 상세 아래쪽 출연자 카드 이미지 lazy loading
- [ ] `#/media` 직접 접근과 PC·모바일 메뉴 MEDIA 활성 상태
- [ ] 모바일 메뉴에서 MEDIA 이동 후 자동 닫힘
- [ ] YouTube preview에서 재생 전 iframe 미생성, 재생 후 해당 iframe만 생성
- [ ] `youtube-nocookie.com` privacy-enhanced embed와 고유 iframe title
- [ ] 일반 영상 및 VR·360° 영상 재생
- [ ] 앨범 전체 재생목록 외부 링크
- [ ] YouTube 썸네일 및 앨범 커버 fallback
- [ ] MEDIA 외부 링크의 새 탭 및 보안 속성

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

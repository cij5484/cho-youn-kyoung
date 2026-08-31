# 홈페이지 운영 문서

> 진행 중: [앨범 공통화·원본 자동 변환 설계와 기준선](./planning/album-system.md). 구현 완료 기록이 아닌 단계별 작업 기준입니다.

- 문서 정리 날짜: 2026-08-31
- 코드 대조 기준 SHA: `41d082b`
- 저장소: `cij5484/cho-youn-kyoung`

이 `docs/` 폴더는 현재 운영 안내와 과거 조사·기획 기록을 함께 보관합니다. 아래의 문서 구분을 먼저 확인하고, 작업 대상의 실제 코드·파일과 대조합니다. 과거 기록의 수치·경로·완료 표시는 현재 상태나 새 작업의 승인 근거로 사용하지 않습니다.

이번 정리는 코드·데이터·파일 경로 대조이며 빌드, 브라우저, 외부 음원·영상 또는 실제 배포 재검증을 의미하지 않습니다.

## 표기 규칙

| 표기 | 의미 | 처리 원칙 |
| --- | --- | --- |
| **확정** | 사용자 원본, 현재 코드, 실제 파일 조사로 확인된 정보 | 그대로 따른다. 변경 시 같은 PR에서 문서도 갱신한다. |
| **권장** | 현재 구조에 맞는 운영 권장안 | 특별한 사유가 없으면 따른다. 예외는 PR에 이유를 남긴다. |
| **미확정** | 아직 UI·규격·원본 확인이 끝나지 않은 정보 | 확정처럼 쓰지 않고, 사용자 확인 후 반영한다. |

## 현재 운영 안내

| 문서 | 역할 |
| --- | --- |
| [WEBSITE-OPERATIONS.md](./WEBSITE-OPERATIONS.md) | 홈페이지 구조, 라우팅, 데이터 파일, 운영 원칙 |
| [HOME-HERO-WORKFLOW.md](./HOME-HERO-WORKFLOW.md) | HOME 대표 Work 선정, RECENT WORKS 데이터 연결·인터랙션·접근성 |
| [PERFORMANCE-WORKFLOW.md](./PERFORMANCE-WORKFLOW.md) | 새 공연 등록 단계, 공연 데이터, 공연별 테마 작업 순서 |
| [ALBUM-WORKFLOW.md](./ALBUM-WORKFLOW.md) | 두 앨범의 HOME·persistent 상세·R2 재생·북클릿과 신규 앨범 등록 원칙 |
| [MEDIA-WORKFLOW.md](./MEDIA-WORKFLOW.md) | MEDIA 공연 영상·언론 보도·특별 기록 등록 및 검수 절차 |
| [ASSET-SPECIFICATIONS.md](./ASSET-SPECIFICATIONS.md) | 현재 파일 형식·운영 규칙과 명시적으로 구분된 과거 실측표 |
| [ASSET-OPTIMIZATION-PLAN.md](./ASSET-OPTIMIZATION-PLAN.md) | WebP 전환 기록, 현재 로딩 정책, 후속 검증 과제 |
| [RELEASE-CHECKLIST.md](./RELEASE-CHECKLIST.md) | PR 전후 콘텐츠·파일·화면·기능·개발 검수 체크리스트 |

## 과거 조사·기획 기록

기존 경로와 본문은 추적을 위해 보존합니다. 아래 문서를 현재 구현 지시서로 사용하지 않습니다.

| 문서 | 기록 범위 |
| --- | --- |
| [ASSET-INVENTORY.md](./ASSET-INVENTORY.md) | 2026-08-10 자산 목록·용량·해시·참조 조사 스냅샷 |
| [ASSET-MIGRATION-MAP.md](./ASSET-MIGRATION-MAP.md) | 2026-07-25 자산 이동·삭제 실행 기록 |
| [ASSET-DUPLICATE-COMPARISON.md](./ASSET-DUPLICATE-COMPARISON.md) | 루트 중복 자산의 당시 비교·승인·처리 기록 |
| [implementation-notes.md](./implementation-notes.md) | 초기 구현 메모. 현재 앨범·Hero 구조와 다름 |
| [planning/site-plan.md](./planning/site-plan.md) | 초기 사이트 기획. 현재 내비게이션·콘텐츠 범위와 다름 |
| [planning/design-guidelines.md](./planning/design-guidelines.md) | 초기 디자인 방향. 현재 작품별 테마·3D 구현의 일괄 변경 근거가 아님 |

## 운영 원칙

1. 추측이나 기억에 의존하지 않고 저장소와 이 문서를 기준으로 판단합니다.
2. 문서 내용과 실제 코드·파일이 다르면 실제 저장소를 먼저 확인하고, 코드 또는 문서를 같은 PR에서 함께 갱신합니다.
3. 향후 구조, 파일명, 데이터 필드, 배포 방식이 바뀌면 관련 문서를 같은 PR에서 갱신합니다.
4. 원본 자료와 홈페이지 문구가 다르면 임의로 고치지 말고 원본, 공식 명칭, 사용자 확인을 거칩니다.
5. Markdown 문서 작업 PR은 `.md` 외 파일 변경과 바이너리 변경이 0건이어야 합니다.
6. 사용 중인 공연·프로필·공용 인물 자산은 `public/assets/`를 기준으로 하며, 앨범 폴더는 실제 자산이 생길 때만 만듭니다.
7. 앨범은 MEDIA가 아니라 WORKS에서 관리합니다. Source of Truth는 `src/data/albums.ts`, 상세 경로는 `/album/:id`이며, HOME에는 `src/data/homeHeroSlides.ts` adapter를 통해 연결합니다.

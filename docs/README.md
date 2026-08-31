# 홈페이지 운영 문서

> 진행 중: [앨범 공통화·원본 자동 변환 설계와 기준선](./planning/album-system.md). 구현 완료 기록이 아닌 단계별 작업 기준입니다.

- 마지막 확인 날짜: 2026-08-30
- 기준 main SHA: `13ff9af`
- 저장소: `cij5484/cho-youn-kyoung`

이 `docs/` 폴더는 조윤경 홈페이지 운영의 공식 기준서(Source of Truth)입니다. 새 공연·앨범·자료 교체 작업을 시작하기 전에는 반드시 관련 문서를 먼저 읽고, 저장소의 실제 파일과 함께 확인합니다.

## 표기 규칙

| 표기 | 의미 | 처리 원칙 |
| --- | --- | --- |
| **확정** | 사용자 원본, 현재 코드, 실제 파일 조사로 확인된 정보 | 그대로 따른다. 변경 시 같은 PR에서 문서도 갱신한다. |
| **권장** | 현재 구조에 맞는 운영 권장안 | 특별한 사유가 없으면 따른다. 예외는 PR에 이유를 남긴다. |
| **미확정** | 아직 UI·규격·원본 확인이 끝나지 않은 정보 | 확정처럼 쓰지 않고, 사용자 확인 후 반영한다. |

## 문서 역할

| 문서 | 역할 |
| --- | --- |
| [WEBSITE-OPERATIONS.md](./WEBSITE-OPERATIONS.md) | 홈페이지 구조, 라우팅, 데이터 파일, 운영 원칙 |
| [HOME-HERO-WORKFLOW.md](./HOME-HERO-WORKFLOW.md) | HOME 대표 Work 선정, RECENT WORKS 데이터 연결·인터랙션·접근성 |
| [PERFORMANCE-WORKFLOW.md](./PERFORMANCE-WORKFLOW.md) | 새 공연 등록 단계, 공연 데이터, 공연별 테마 작업 순서 |
| [ALBUM-WORKFLOW.md](./ALBUM-WORKFLOW.md) | WORKS 앨범 등록, HOME Hero 연결, 향후 앨범 상세·재생·북클릿 운영 원칙 |
| [MEDIA-WORKFLOW.md](./MEDIA-WORKFLOW.md) | MEDIA 공연 영상·언론 보도·특별 기록 등록 및 검수 절차 |
| [ASSET-SPECIFICATIONS.md](./ASSET-SPECIFICATIONS.md) | 포스터·리플렛·웹 배경·출연자 사진의 실제 규격과 권장 규칙 |
| [ASSET-OPTIMIZATION-PLAN.md](./ASSET-OPTIMIZATION-PLAN.md) | 대용량 웹 자산의 경량화 우선순위, 제공 규격, 교체·검수 순서 |
| [ASSET-INVENTORY.md](./ASSET-INVENTORY.md) | 현재 저장소 자산 전수 목록과 참조 현황 |
| [ASSET-MIGRATION-MAP.md](./ASSET-MIGRATION-MAP.md) | `public/assets/` 표준 구조로 이전한 경로 대응표와 최종 처리 결과 |
| [ASSET-DUPLICATE-COMPARISON.md](./ASSET-DUPLICATE-COMPARISON.md) | 삭제된 루트 2026-08-16 자료 5개와 최종 사용본의 역사적 정밀 비교 및 처리 결과 |
| [RELEASE-CHECKLIST.md](./RELEASE-CHECKLIST.md) | PR 전후 콘텐츠·파일·화면·기능·개발 검수 체크리스트 |

## 운영 원칙

1. 추측이나 기억에 의존하지 않고 저장소와 이 문서를 기준으로 판단합니다.
2. 문서 내용과 실제 코드·파일이 다르면 실제 저장소를 먼저 확인하고, 코드 또는 문서를 같은 PR에서 함께 갱신합니다.
3. 향후 구조, 파일명, 데이터 필드, 배포 방식이 바뀌면 관련 문서를 같은 PR에서 갱신합니다.
4. 원본 자료와 홈페이지 문구가 다르면 임의로 고치지 말고 원본, 공식 명칭, 사용자 확인을 거칩니다.
5. Markdown 문서 작업 PR은 `.md` 외 파일 변경과 바이너리 변경이 0건이어야 합니다.
6. 사용 중인 공연·프로필·공용 인물 자산은 `public/assets/`를 기준으로 하며, 앨범 폴더는 실제 자산이 생길 때만 만듭니다.
7. 앨범은 MEDIA가 아니라 WORKS에서 관리합니다. Source of Truth는 `src/data/albums.ts`, 향후 상세 경로는 `/album/:id`이며, HOME에는 `src/data/homeHeroSlides.ts` adapter를 통해 연결합니다.

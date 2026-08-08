# 앨범 등록 워크플로

- 마지막 확인 날짜: 2026-07-26
- 기준 commit SHA: `0856c7299b97c4ca04db18eadf7595ef8f66f60f` (PR #51 후속 커밋)

앨범 작업도 공연 작업과 동일하게 원본 자료를 먼저 확인하고, 확정·권장·미확정 정보를 구분합니다. 아직 저장소에서 확정되지 않은 앨범 목록·상세·Viewer UI나 픽셀 규격은 **미확정**으로 표시합니다.

## 먼저 받아야 할 자료

| 자료 | 상태 | 설명 |
| --- | --- | --- |
| 앨범명 | 확정 필요 | 표지, 음원 플랫폼, 보도자료 표기와 대조 |
| 발매일 | 확정 필요 | 연도만 있는 경우 전체 날짜는 미확정으로 둔다 |
| 앨범 소개 | 확정 필요 | 원문을 임의로 재작성하지 않는다 |
| 트랙 목록 | 확정 필요 | 트랙 번호, 제목, 길이, 악장 구분 확인 |
| 작곡·편곡·연주자 크레딧 | 확정 필요 | 이름, 역할, 표기 언어 확인 |
| 커버 이미지 | 확정 필요 | 웹용과 원본 인쇄·배포용을 구분 |
| 부클릿 이미지·PDF | 확정 필요 | Viewer용 이미지와 다운로드 PDF 분리 |
| 음원 플랫폼 링크 | 확정 필요 | 공식 URL만 사용 |
| 저작권·유통 정보 | 확정 필요 | 레이블, 유통사, 저작권 문구 확인 |
| 참여 연주자 | 확정 필요 | 공연 프로필 재사용 여부 확인 |
| 앨범별 테마 | 권장 | 앨범 고유 디자인은 앨범 테마 범위에 제한 |

## 권장 폴더 구조

```txt
public/assets/albums/{album-id}/
├─ web/
│  ├─ cover.png
│  └─ detail-hero-desktop.png
├─ viewer/
│  ├─ booklet-01.png
│  ├─ booklet-02.png
│  └─ ...
├─ downloads/
│  └─ booklet.pdf
└─ thumbnails/
   └─ media-{number}.jpg
```

공연과 앨범의 이미지 폴더를 섞지 않습니다. 공연 자료는 `public/assets/performances/`, 앨범 자료는 `public/assets/albums/` 아래에 둡니다.

- `web/cover.png`는 커버가 있을 때 사용합니다. `detail-hero-desktop.png`, 부클릿 Viewer 이미지와 PDF, 미디어 썸네일은 실제 필요한 경우에만 만듭니다.
- 실제 자산이 생기기 전에는 빈 폴더를 만들지 않습니다.
- Affinity 원본, TIFF, 인쇄 마스터, 편집 원본은 GitHub에 넣지 않습니다.
- Viewer 이미지는 `viewer/`, 다운로드 PDF는 `downloads/`에 두어 서로 분리합니다.
- 공용 인물 사진은 `public/assets/people/{person-id}/portrait.jpg`를 우선 사용하고, 앨범 전용 이미지는 필요한 경우에만 앨범 폴더에 둡니다.
- 파일명은 영문 소문자 kebab-case를 사용합니다. `final`, `최종`, `new`, `수정`, `(1)` 같은 버전명은 사용하지 않으며 버전 관리는 Git 기록으로 합니다.

## 원본 자료 검수

1. 앨범명, 발매일, 트랙명, 작곡·편곡·연주자 이름을 원본 자료와 대조합니다.
2. 음원 플랫폼 링크가 실제 공개 페이지인지 확인합니다.
3. 저작권·유통 정보는 임의 생성하지 않습니다.
4. 부클릿 문구를 웹용으로 축약해야 하면 사용자 승인을 받습니다.
5. 원본과 웹 문장이 달라진 경우 이유를 PR에 기록합니다.

## `src/data/albums.ts` 입력

현재 `Album` 타입의 필드는 다음과 같습니다.

| 필드 | 필수 여부 | 용도 |
| --- | --- | --- |
| `id` | 필수 | 앨범을 식별하는 영문 소문자 kebab-case ID |
| `title` | 필수 | 공식 앨범명 |
| `year` | 필수 | 확인된 발매 연도 문자열 |
| `description` | 필수 | 목록 등에 사용하는 짧은 앨범 소개 |
| `coverImage` | 선택 | 웹용 커버 이미지의 public 상대경로 |
| `detailsPath` | 선택 | 상세 화면이 실제로 생겼을 때 사용하는 경로 |
| `featured` | 선택 | 대표 앨범 노출 여부 |
| `releaseDate` | 선택 | 확인된 전체 발매일. 향후 `YYYY-MM-DD` 형식을 사용 |
| `tracks` | 선택 | 트랙 번호·제목과 트랙별 선택 정보를 담는 `AlbumTrack[]` |
| `participants` | 선택 | 앨범 참여자와 역할을 담는 `AlbumParticipant[]` |
| `credits` | 선택 | 앨범 전체 제작 크레딧을 담는 `AlbumCredit[]` |
| `booklet` | 선택 | Viewer 미리보기 이미지와 선택적 PDF 다운로드 정보 |
| `streamingLinks` | 선택 | 공식 스트리밍·음원 플랫폼 링크 목록 |
| `media` | 선택 | 관련 영상·이미지·기사 목록 |
| `downloads` | 선택 | 부클릿 외에 실제 제공하는 다운로드 목록 |

### 추가 타입

| 타입 | 용도 |
| --- | --- |
| `AlbumTrackCredit` | 한 트랙 안에서 역할과 이름을 연결하는 트랙별 크레딧 |
| `AlbumTrack` | 트랙 번호와 제목, 선택적 부제·재생 시간·트랙 크레딧 |
| `AlbumParticipant` | 참여자 이름·역할과 선택적 ID·이미지·설명 |
| `AlbumCredit` | 역할별 이름 목록과 선택적 섹션으로 구성한 앨범 전체 크레딧 |
| `AlbumBookletImage` | 부클릿 Viewer 이미지 경로·대체 텍스트와 선택적 라벨 |
| `AlbumBooklet` | 부클릿 미리보기 이미지 목록과 선택적 PDF URL·다운로드 라벨 |
| `AlbumStreamingLink` | 플랫폼 이름·공식 URL과 선택적 표시 라벨. 플랫폼은 고정 enum으로 제한하지 않음 |
| `AlbumMediaItem` | `video`, `image`, `article` 관련 자료와 선택적 URL·썸네일·설명 |
| `AlbumDownload` | 다운로드 라벨·URL과 선택적 파일 형식 |

트랙 크레딧(`AlbumTrackCredit`)과 앨범 전체 크레딧(`AlbumCredit`)은 범위가 다르므로 구분해 입력합니다. 확인되지 않은 정보는 데이터에 추가하지 않고, 빈 배열도 억지로 넣지 않습니다. 값이 없는 선택 필드는 생략하며 향후 UI에서는 데이터가 있을 때만 해당 섹션을 표시합니다. 이번 PR에서는 앨범 상세 UI, 라우트, 버튼을 만들지 않습니다.

HOME RECENT WORKS에는 확정 `releaseDate`, 실제 `coverImage`, 실제 `detailsPath`, 전용 Hero Scene이 모두 준비된 앨범만 연결합니다. 앨범 원본은 계속 `albums.ts`에서 관리하고 HOME adapter에는 원본 내용을 복사하지 않습니다. 자세한 연결 절차는 [HOME-HERO-WORKFLOW.md](./HOME-HERO-WORKFLOW.md)를 따릅니다.

## 검수

- 목록: 앨범 정렬과 대표 앨범 노출을 확인하고, 실제 커버가 있으면 커버가 표시되는지 확인합니다. 커버가 없으면 임시 박스 없이 앨범 정보가 텍스트 단일 열로 표시되는지 확인합니다.
- 상세: **미확정**. 상세 UI가 생기면 경로, 헤더, 본문, 크레딧 확인
- Viewer: **미확정**. 부클릿 이미지 표시 순서와 전체화면 동작 확인
- 다운로드: PDF URL, 파일명, 새 창/다운로드 동작 확인
- 회귀: 공연 Viewer와 공연 이미지 경로가 영향받지 않는지 확인

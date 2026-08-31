# MEDIA 페이지 운영 절차

- 코드 대조 날짜: 2026-08-31
- 작업 기준 main SHA: `41d082b`

## 1. 목적과 경로

MEDIA는 공연 영상, 언론 보도, 특별한 음악 기록을 한곳에서 소개하는 페이지이며 HashRouter의 `/media`(공개 URL `#/media`)에서 제공됩니다.

## 2. 데이터 파일의 역할

- `src/data/media.ts`: 영상·음원·외부 기록의 표시 정보와 `featured` / `selected` / `special` 분류를 관리합니다. 영상 추가는 이 배열에 객체를 추가하는 것으로 완료합니다.
- `src/data/albums.ts`: 앨범 Source of Truth이며 `/works`의 ALBUMS에서 소비합니다. MEDIA에는 DISCOGRAPHY를 두지 않습니다.
- `src/data/press.ts`: PRESS & ARTICLES의 독립 Source of Truth입니다. `PressArticle`은 `id`, `outlet`, `publishedDate`, `title`, `url`과 선택 필드 `shortDescription`, `category`, `label`을 가집니다. UI는 날짜를 기준으로 자동 최신순 정렬된 export를 사용합니다.

## 3. PRESS & ARTICLES 운영

PRESS는 기사 원문을 복제하는 영역이 아니라 확인된 제목·매체·날짜·짧은 소개와 원문 링크를 제공하는 편집형 목록입니다. ID는 영문 소문자 kebab-case로 고유하게 작성하고, 날짜는 `YYYY-MM-DD`, URL은 원문의 canonical HTTPS 주소를 사용합니다.

다만 오래된 기사의 원 언론사 canonical URL을 현재 검증할 수 없고 신뢰할 수 있는 뉴스 아카이브에서 원 매체·제목·날짜를 확인할 수 있는 경우에만 검증된 아카이브 URL을 fallback으로 사용합니다. 원문 URL을 임의로 추측하지 않으며, 이 예외는 일반적인 신규 기사에 적용하지 않습니다.

새 기사는 매체명, 기사 제목, 발행일, URL을 공식 원문에서 검증한 뒤 `pressArticles`에 객체 하나만 추가합니다. 배열 위치와 관계없이 최신순으로 표시됩니다. 가짜·placeholder 기사는 금지하며 확인된 기사가 0건이어도 빈 상태 UI가 안전하게 표시됩니다. 링크는 새 탭과 `rel="noopener noreferrer"`를 사용하고 기사 전문을 저장하지 않습니다.

기본 운영에는 이미지가 필요하지 않습니다. 사용 허가된 대표 이미지, 공식 보도자료 PDF 등 실제 자산이 필요한 경우에만 `public/assets/press/{press-id}/`를 만들며 빈 폴더는 생성하지 않습니다.

MEDIA Hero의 editorial index와 본문은 `media.ts`의 단일 `mediaSections` 정의를 공유합니다. 항목은 button으로 해당 section ID에 programmatic `scrollIntoView`를 실행해 HashRouter URL을 변경하지 않습니다. 고정 Header는 `scroll-margin-top`으로 보정하고, 일반 환경은 smooth, reduced-motion 환경은 auto scroll을 사용합니다. PRESS 역시 기존 serif/sans, gold, rule, spacing, motion-link 디자인 언어를 유지합니다.

## 4. 공연 영상 추가

1. 공식 제목, 기관명, 설명, 공개 상태와 영상 ID를 확인합니다.
2. 공유 URL을 정규화하고 `mediaItems`에 고유한 `id`로 객체를 추가합니다.
3. 대표 영상은 `featured`, 보조 공연 영상은 `selected`, 수상·과거 경력 기록은 `special`로 분류합니다.
4. 대표 영상은 페이지 정보 위계상 가장 중요한 최신·대표 공연만 선정하고, 나머지는 보조 영상으로 둡니다.
5. 미리보기, 외부 링크, 모바일 1열, 키보드 재생을 검수합니다.

```ts
{
  id: 'verified-performance-id',
  section: 'selected',
  kind: 'youtube-video',
  title: '확인된 공연명',
  description: '확인된 공연 설명',
  youtubeId: 'abcdefghijk',
  url: 'https://youtu.be/abcdefghijk',
  label: 'WATCH VIDEO',
}
```

## 5. YouTube 규칙

- `youtu.be/{id}` 또는 `youtube.com/watch?v={id}`를 기준으로 영상 ID를 확인한 뒤 URL은 불필요한 공유 파라미터 없이 저장합니다.
- `?si=`, 추적 파라미터, 시간 지정 등 공유용 파라미터를 제거합니다. `youtubeId`에는 URL이 아닌 11자리 영상 ID만 저장합니다.
- 썸네일은 `i.ytimg.com` 원격 URL을 런타임에 사용하며 저장소에 복사하지 않습니다.
- 재생 전 iframe을 만들지 않고, 사용자 재생 후 `youtube-nocookie.com`의 privacy-enhanced embed만 생성합니다.
- VR·360° 영상도 동일한 embed를 사용하며 제목·설명·버튼 라벨로 성격을 알립니다.
- 배포 전 각 영상을 직접 열어 삭제·비공개·연령 제한 상태와 썸네일 fallback을 확인합니다. 사용할 수 없으면 검증된 대체 URL로 데이터만 갱신하거나 노출을 중단합니다.

## 6. MEDIA 섹션 구조

MEDIA는 `01 FEATURED PERFORMANCE`, `02 PRESS & ARTICLES`, `03 SELECTED PERFORMANCES`, `04 SPECIAL ARCHIVE`로 구성합니다. 앨범 등록과 재생 링크 운영은 [ALBUM-WORKFLOW.md](./ALBUM-WORKFLOW.md)를 따르며 WORKS에서 노출합니다.

## 7. 일반 MEDIA용 로컬 영상·오디오

**향후 확장안:** `MediaKind` 타입에는 `local-video` / `local-audio` / `external`이 있지만 현재 `MediaPage`의 카드는 `YouTubePreview`를 사용하며 kind별 로컬 재생 UI는 구현되어 있지 않습니다. 따라서 데이터의 kind만 바꿔도 MP4/MP3가 재생된다고 안내하지 않습니다. 현재 등록된 영상 4개는 모두 `youtube-video`입니다.

독립 로컬 자료를 도입할 때에는 실제 파일을 받은 뒤 `public/assets/media/{media-id}/` 경로와 별도 재생 UI를 함께 설계·구현·검수합니다. 이 확장은 앨범 R2 플레이어와 별개이며 이번 문서 정리에서 구현하지 않습니다. 파일이 없는 동안 경로나 빈 폴더를 미리 만들지 않습니다.

### 앨범 상세용 외부 웹 음원과의 구분

- 앨범은 MEDIA에 DISCOGRAPHY로 다시 만들지 않으며 `albums.ts`를 Source of Truth로 WORKS에서 관리합니다.
- 현재 `/album/:id` 플레이어는 `albums.ts`의 `AlbumTrack.webAudioUrl`을 사용합니다. 두 앨범의 각 6개 트랙은 외부 Cloudflare R2 MP3 URL에 연결되어 있고 GitHub의 `public/assets/media/`에 저장하지 않습니다.
- `useAlbumAudio`가 실제 오디오 요소와 재생 상태를 관리합니다. 공식 플랫폼 링크는 별도 `streamingLinks`이며, 데이터에 URL이 있다는 사실과 해당 음원의 실제 접근·재생 가능 여부는 구분해 검수합니다.
- 공식 플랫폼 외부 링크와 자체 웹 플레이어의 트랙 URL을 구분하고 확인되지 않은 URL은 만들지 않습니다.
- 앨범 Hero, 상세, 재생과 북클릿의 전체 원칙은 [ALBUM-WORKFLOW.md](./ALBUM-WORKFLOW.md)를 따릅니다.

## 8. 콘텐츠 검증 원칙

- 제목, 연도, 기관명, 수상 정보는 공식 원본에서 확인된 값만 입력합니다.
- `featured`는 대표 공연, `selected`는 보조·선별 공연, `special`은 수상·과거 경력 등 특별 기록에만 사용합니다.
- 삭제·비공개 영상은 릴리스 전 YouTube 원본 URL과 페이지 내 재생을 모두 확인합니다.
- 실제 파일이 없는 빈 디렉터리는 생성하지 않습니다.

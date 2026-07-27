# MEDIA 페이지 운영 절차

- 마지막 확인 날짜: 2026-07-27
- 작업 기준 main SHA: `01b57156d81e`

## 1. 목적과 경로

MEDIA는 공연 영상, 음반, 특별한 음악 기록을 한곳에서 소개하는 페이지이며 HashRouter의 `/media`(공개 URL `#/media`)에서 제공됩니다.

## 2. 데이터 파일의 역할

- `src/data/media.ts`: 영상·음원·외부 기록의 표시 정보와 `featured` / `selected` / `special` 분류를 관리합니다. 영상 추가는 이 배열에 객체를 추가하는 것으로 완료합니다.
- `src/data/albums.ts`: 앨범 설명, 커버, 재생 링크를 관리합니다. MEDIA 페이지는 이 배열을 직접 순회하므로 앨범을 `media.ts`에 중복 입력하지 않습니다.

## 3. 공연 영상 추가

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

## 4. YouTube 규칙

- `youtu.be/{id}` 또는 `youtube.com/watch?v={id}`를 기준으로 영상 ID를 확인한 뒤 URL은 불필요한 공유 파라미터 없이 저장합니다.
- `?si=`, 추적 파라미터, 시간 지정 등 공유용 파라미터를 제거합니다. `youtubeId`에는 URL이 아닌 11자리 영상 ID만 저장합니다.
- 썸네일은 `i.ytimg.com` 원격 URL을 런타임에 사용하며 저장소에 복사하지 않습니다.
- 재생 전 iframe을 만들지 않고, 사용자 재생 후 `youtube-nocookie.com`의 privacy-enhanced embed만 생성합니다.
- VR·360° 영상도 동일한 embed를 사용하며 제목·설명·버튼 라벨로 성격을 알립니다.
- 배포 전 각 영상을 직접 열어 삭제·비공개·연령 제한 상태와 썸네일 fallback을 확인합니다. 사용할 수 없으면 검증된 대체 URL로 데이터만 갱신하거나 노출을 중단합니다.

## 5. 앨범과 재생목록 추가

1. `albums.ts`에 고유 ID, 확인된 제목·연도·설명을 입력합니다.
2. 실제 커버 파일이 있을 때만 `coverImage`를 추가하고 커버를 표시합니다. `coverImage`가 없으면 임시 커버를 만들지 않고 앨범 정보를 단일 열로 표시합니다. 확인되지 않은 커버 이미지나 가상 커버를 임의로 생성하지 않습니다.
3. 전체 재생목록은 `streamingLinks`에 플랫폼, URL, 라벨을 추가합니다.
4. 앨범 전체 재생목록과 그 안의 개별 트랙 링크를 같은 페이지에 중복 노출하지 않습니다.
5. 실제 수록곡명·참여자 정보는 원본으로 확인된 경우에만 추가합니다.

```ts
streamingLinks: [{
  platform: 'YouTube',
  label: 'LISTEN TO ALBUM',
  url: 'https://www.youtube.com/playlist?list=확인된_재생목록_ID',
}]
```

## 6. 자체 영상·음원 추가

실제 파일을 받은 뒤 `public/assets/media/{media-id}/` 아래에 MP4 또는 MP3/WAV를 저장하고, `media.ts`의 `kind`를 `local-video` 또는 `local-audio`로 지정해 연결합니다. 파일이 없는 동안 경로 또는 빈 폴더를 미리 만들지 않습니다. 파일 형식, 크기, 저작권, 브라우저 재생과 fallback을 배포 전에 확인합니다.

## 7. 콘텐츠 검증 원칙

- 제목, 연도, 기관명, 수상 정보는 공식 원본에서 확인된 값만 입력합니다.
- `featured`는 대표 공연, `selected`는 보조·선별 공연, `special`은 수상·과거 경력 등 특별 기록에만 사용합니다.
- 삭제·비공개 영상은 릴리스 전 YouTube 원본 URL과 페이지 내 재생을 모두 확인합니다.
- 실제 파일이 없는 빈 디렉터리는 생성하지 않습니다.

import { useState } from 'react';

type YouTubePreviewProps = {
  youtubeId?: string;
  title: string;
};

export function YouTubePreview({ youtubeId, title }: YouTubePreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);

  if (!youtubeId) {
    return <div className="media-youtube media-youtube--unavailable"><span>{title}</span></div>;
  }

  if (isPlaying) {
    return (
      <div className="media-youtube">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1`}
          title={`${title} YouTube 영상`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          loading="lazy"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className={`media-youtube${thumbnailFailed ? ' media-youtube--fallback' : ''}`}>
      {!thumbnailFailed && (
        <img
          src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setThumbnailFailed(true)}
        />
      )}
      {thumbnailFailed && <span className="media-youtube__fallback-title">{title}</span>}
      <button type="button" onClick={() => setIsPlaying(true)} aria-label={`${title} 재생`}>
        <span aria-hidden="true" />
      </button>
    </div>
  );
}

import type { ReactNode } from 'react';

type AlbumClosedInfoProps = {
  action: ReactNode;
  eyebrow?: string;
  headingId?: string;
  status?: string;
  subtitle?: string;
  title: string;
  trackCount?: number;
  year: string;
};

export function AlbumClosedInfo({
  action,
  eyebrow = 'ALBUM',
  headingId,
  status,
  subtitle,
  title,
  trackCount,
  year,
}: AlbumClosedInfoProps) {
  return (
    <div className="album-closed-info">
      <p className="album-closed-info__eyebrow">{eyebrow}</p>
      <h1 id={headingId}>{title}</h1>
      {subtitle ? <h2>{subtitle}</h2> : null}
      <p className="album-closed-info__meta">
        <span>{year}</span>
        {status ? <strong>{status}</strong> : null}
      </p>
      {trackCount ? <p className="album-closed-info__tracks">{trackCount} TRACKS</p> : null}
      <div className="album-closed-info__action">{action}</div>
    </div>
  );
}

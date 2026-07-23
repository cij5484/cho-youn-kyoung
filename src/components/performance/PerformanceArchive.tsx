import { useEffect, useRef, useState } from 'react';
import { SafeImage } from '../common/SafeImage';
import type { ArchiveMaterial } from '../../data/performances';
import { assetUrl } from '../../utils/assetUrl';

type Props = { performanceTitle: string; materials?: ArchiveMaterial[]; tone: 'gold' | 'navy'; className?: string };
const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function PerformanceArchive({ performanceTitle, materials = [], tone, className = 'performance-archive' }: Props) {
  const [active, setActive] = useState<ArchiveMaterial | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastButton = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(null);
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusables = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector));
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', onKeyDown); lastButton.current?.focus(); };
  }, [active]);

  if (!materials.length) return null;

  return <>
    <div className={`${className} performance-archive--${tone}`}>
      {materials.map((material) => (
        <article className="performance-archive__material" key={material.label}>
          <p>{material.label}</p>
          <div>
            {material.previewImages.length > 0 && <button type="button" aria-label={`${performanceTitle} ${material.label === 'POSTER' ? '포스터' : '리플렛'} 확대 보기`} onClick={(event) => { lastButton.current = event.currentTarget; setActive(material); }}>{material.viewLabel}</button>}
            {material.downloadUrl && <a href={assetUrl(material.downloadUrl)} download aria-label={`${performanceTitle} ${material.label === 'POSTER' ? '포스터' : '리플렛'} ${material.downloadLabel?.replace('DOWNLOAD ', '') ?? '파일'} 다운로드`}>{material.downloadLabel ?? 'DOWNLOAD PDF'}</a>}
          </div>
        </article>
      ))}
    </div>
    {active && <div className="archive-viewer__backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setActive(null); }}>
      <div className={`archive-viewer archive-viewer--${active.label.toLowerCase()}`} role="dialog" aria-modal="true" aria-labelledby="archive-viewer-title" tabIndex={-1} ref={dialogRef}>
        <header><p id="archive-viewer-title">{active.label}</p><button type="button" ref={closeButtonRef} aria-label={`${active.label === 'POSTER' ? '포스터' : '리플렛'} 뷰어 닫기`} onClick={() => setActive(null)}>CLOSE</button></header>
        <div className="archive-viewer__images">{active.previewImages.map((image) => <figure key={image.src}>{image.label && <figcaption>{image.label}</figcaption>}<SafeImage src={assetUrl(image.src)} alt={image.alt} fallbackClassName="safe-image-fallback" fallbackLabel={image.label ?? active.label} /></figure>)}</div>
      </div>
    </div>}
  </>;
}

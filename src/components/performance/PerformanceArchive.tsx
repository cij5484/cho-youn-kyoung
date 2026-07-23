import { useEffect, useId, useRef, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { SafeImage } from '../common/SafeImage';
import type { ArchiveMaterial } from '../../data/performances';
import { assetUrl } from '../../utils/assetUrl';

export type ArchiveViewerTone = 'gold' | 'navy';

const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function ArchiveViewer({ activeMaterial, closeMaterial, lastTriggerRef, tone }: {
  activeMaterial: ArchiveMaterial | null;
  closeMaterial: () => void;
  lastTriggerRef: RefObject<HTMLButtonElement | null>;
  tone: ArchiveViewerTone;
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!activeMaterial) return;
    const previousOverflow = document.body.style.overflow;
    const triggerToRestore = lastTriggerRef.current;
    document.body.style.overflow = 'hidden';
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMaterial();
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusables = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector));
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      triggerToRestore?.focus();
    };
  }, [activeMaterial, closeMaterial, lastTriggerRef]);

  if (!activeMaterial || typeof document === 'undefined') return null;

  return createPortal(
    <div className={`archive-viewer__backdrop archive-viewer__backdrop--${tone}`} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeMaterial(); }}>
      <div className={`archive-viewer archive-viewer--${tone} archive-viewer--${activeMaterial.label.toLowerCase()}`} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} ref={dialogRef}>
        <header className="archive-viewer__header">
          <p id={titleId}>{activeMaterial.label}</p>
          <button type="button" ref={closeButtonRef} aria-label={`${activeMaterial.label === 'POSTER' ? '포스터' : '리플렛'} 뷰어 닫기`} onClick={closeMaterial}>CLOSE</button>
        </header>
        <div className="archive-viewer__images">
          {activeMaterial.previewImages.map((image) => <figure key={image.src}>{image.label && <figcaption>{image.label}</figcaption>}<SafeImage src={assetUrl(image.src)} alt={image.alt} fallbackClassName="safe-image-fallback" fallbackLabel={image.label ?? activeMaterial.label} /></figure>)}
        </div>
      </div>
    </div>,
    document.body,
  );
}

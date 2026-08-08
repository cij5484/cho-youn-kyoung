import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

const CREDIT_REVEAL_MS = 1300;
const PERSONAL_DWELL_MS = 3000;
const PERSONAL_DELAY_MS = CREDIT_REVEAL_MS + PERSONAL_DWELL_MS;

export function HomeCreativeCredit() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPersonalVisible, setIsPersonalVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const dwellTimerRef = useRef<number | null>(null);

  const hasFineHoverPointer = useCallback(
    () => window.matchMedia('(hover: hover) and (pointer: fine)').matches,
    [],
  );

  const cancelDwell = useCallback(() => {
    if (dwellTimerRef.current !== null) {
      window.clearTimeout(dwellTimerRef.current);
      dwellTimerRef.current = null;
    }
  }, []);

  const collapse = useCallback(() => {
    cancelDwell();
    setIsPersonalVisible(false);
    setIsExpanded(false);
  }, [cancelDwell]);

  const beginDesktopDwell = useCallback(() => {
    if (!hasFineHoverPointer()) return;
    cancelDwell();
    setIsExpanded(true);
    setIsPersonalVisible(false);
    // Let the credit settle before counting the three-second personal-message dwell.
    dwellTimerRef.current = window.setTimeout(() => {
      setIsPersonalVisible(true);
      dwellTimerRef.current = null;
    }, PERSONAL_DELAY_MS);
  }, [cancelDwell, hasFineHoverPointer]);

  useEffect(() => cancelDwell, [cancelDwell]);

  useEffect(() => {
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape' && isExpanded) collapse();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [collapse, isExpanded]);

  useEffect(() => {
    if (!isExpanded || hasFineHoverPointer()) return undefined;
    const handleOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) collapse();
    };
    document.addEventListener('pointerdown', handleOutsidePointer);
    return () => document.removeEventListener('pointerdown', handleOutsidePointer);
  }, [collapse, hasFineHoverPointer, isExpanded]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    if (isExpanded) {
      setIsPersonalVisible((visible) => !visible);
    } else {
      beginDesktopDwell();
      setIsExpanded(true);
    }
  };

  return (
    <div
      className={`home-creative-credit${isExpanded ? ' is-expanded' : ''}${isPersonalVisible ? ' is-personal-visible' : ''}`}
      ref={rootRef}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') beginDesktopDwell();
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse' && hasFineHoverPointer()) collapse();
      }}
      onFocus={beginDesktopDwell}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) collapse();
      }}
    >
      <div className="home-creative-credit__rotated">
        <span className="home-creative-credit__line">
          <span className="home-creative-credit__prefix" id="home-creative-credit-text" aria-hidden={!isExpanded}>
            <span>CREATIVE DIRECTION &amp; DESIGN —&nbsp;</span>
          </span>
          <button
            className="home-creative-credit__anchor"
            type="button"
            aria-expanded={isExpanded}
            aria-controls="home-creative-credit-text home-creative-credit-personal"
            aria-label={isExpanded ? 'Soul.P 제작 크레딧' : 'Soul 제작 크레딧 열기'}
            onClick={() => {
              if (hasFineHoverPointer()) return;
              if (!isExpanded) setIsExpanded(true);
              else setIsPersonalVisible((visible) => !visible);
            }}
            onKeyDown={handleKeyDown}
          >
            <span>Soul</span><span className="home-creative-credit__suffix" aria-hidden={!isExpanded}>.P</span>
          </button>
        </span>
        <span
          className="home-creative-credit__personal"
          id="home-creative-credit-personal"
          aria-hidden={!isPersonalVisible}
        >
          사랑하는 소울과 하울의 아빠
        </span>
      </div>
    </div>
  );
}

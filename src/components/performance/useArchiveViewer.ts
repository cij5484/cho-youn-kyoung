import { useCallback, useRef, useState } from 'react';
import type { ArchiveMaterial } from '../../data/performances';

export function useArchiveViewer() {
  const [activeMaterial, setActiveMaterial] = useState<ArchiveMaterial | null>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  const openMaterial = useCallback((material: ArchiveMaterial, trigger: HTMLButtonElement) => {
    lastTriggerRef.current = trigger;
    setActiveMaterial(material);
  }, []);

  const closeMaterial = useCallback(() => setActiveMaterial(null), []);

  return { activeMaterial, openMaterial, closeMaterial, lastTriggerRef };
}

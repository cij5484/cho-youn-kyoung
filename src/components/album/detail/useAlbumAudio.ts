import { useEffect, useRef, useState } from 'react';
import type { AlbumTrack } from '../../../data/albums';

export const getNextTrackIndex = (currentIndex: number, trackCount: number) => {
  const nextIndex = currentIndex + 1;
  return currentIndex >= 0 && nextIndex < trackCount ? nextIndex : null;
};

export function useAlbumAudio(tracks: AlbumTrack[]) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const tracksRef = useRef(tracks);
  const volumeRef = useRef(1);
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [error, setError] = useState('');
  const previewTimer = useRef<number | null>(null);
  const track = tracks[selected];

  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  useEffect(() => () => {
    const current = audio.current;
    current?.pause();
    if (current) {
      current.ontimeupdate = null;
      current.onloadedmetadata = null;
      current.onended = null;
      current.onerror = null;
    }
    if (previewTimer.current !== null) window.clearInterval(previewTimer.current);
  }, []);

  const releaseAudio = () => {
    const current = audio.current;
    if (!current) return;
    current.pause();
    current.ontimeupdate = null;
    current.onloadedmetadata = null;
    current.onended = null;
    current.onerror = null;
    audio.current = null;
  };

  const createAudio = (index: number): HTMLAudioElement | null => {
    const source = tracksRef.current[index]?.webAudioUrl;
    if (!source) return null;
    const next = new Audio(source);
    next.volume = volumeRef.current;
    next.preload = 'metadata';
    next.ontimeupdate = () => setTime(next.currentTime);
    next.onloadedmetadata = () => setDuration(next.duration);
    next.onended = () => {
      const nextIndex = getNextTrackIndex(index, tracksRef.current.length);
      if (nextIndex === null) {
        setPlaying(false);
        return;
      }

      setSelected(nextIndex);
      setTime(0);
      setDuration(0);
      setError('');
      const following = createAudio(nextIndex);
      audio.current = following;
      if (!following) {
        setPlaying(false);
        return;
      }
      void following.play()
        .then(() => {
          if (audio.current === following) setPlaying(true);
        })
        .catch(() => {
          if (audio.current !== following) return;
          setError('다음 트랙을 재생할 수 없습니다.');
          setPlaying(false);
        });
    };
    next.onerror = () => {
      if (audio.current !== next) return;
      setError('오디오를 불러올 수 없습니다.');
      setPlaying(false);
    };
    return next;
  };

  const ensureAudio = () => {
    if (!track?.webAudioUrl) return null;
    if (!audio.current || audio.current.src !== new URL(track.webAudioUrl, window.location.href).href) {
      releaseAudio();
      const next = createAudio(selected);
      audio.current = next;
    }
    return audio.current;
  };

  const select = (index: number) => {
    if (index < 0 || index >= tracks.length) return;
    releaseAudio();
    if (previewTimer.current !== null) window.clearInterval(previewTimer.current);
    previewTimer.current = null;
    setPlaying(false); setTime(0); setDuration(0); setError(''); setSelected(index);
  };
  const toggle = async () => {
    const element = ensureAudio();
    if (!element) {
      // Until masters are delivered, keep the transport testable: PLAY drives
      // the physical disc and a silent preview clock rather than disabling UI.
      if (playing) {
        if (previewTimer.current !== null) window.clearInterval(previewTimer.current);
        previewTimer.current = null;
        setPlaying(false);
      } else {
        previewTimer.current = window.setInterval(() => setTime((value) => value + 0.25), 250);
        setPlaying(true);
      }
      return;
    }
    if (playing) { element.pause(); setPlaying(false); return; }
    try { await element.play(); setPlaying(true); } catch { setError('재생을 시작할 수 없습니다.'); }
  };
  const seek = (value: number) => { if (audio.current) audio.current.currentTime = value; setTime(value); };
  const setVolume = (value: number) => {
    const nextVolume = Math.min(1, Math.max(0, value));
    volumeRef.current = nextVolume;
    setVolumeState(nextVolume);

    if (audio.current) {
      audio.current.volume = nextVolume;
    }
  };
  const pause = () => {
    audio.current?.pause();
    if (previewTimer.current !== null) window.clearInterval(previewTimer.current);
    previewTimer.current = null;
    setPlaying(false);
  };
  return { selected, track, playing, time, duration, volume, error, select, toggle, seek, setVolume, pause, playable: true, hasAudio: Boolean(track?.webAudioUrl) };
}

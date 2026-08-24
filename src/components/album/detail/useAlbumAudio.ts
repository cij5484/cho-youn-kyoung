import { useEffect, useRef, useState } from 'react';
import type { AlbumTrack } from '../../../data/albums';

export function useAlbumAudio(tracks: AlbumTrack[]) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [error, setError] = useState('');
  const previewTimer = useRef<number | null>(null);
  const track = tracks[selected];

  useEffect(() => () => {
    audio.current?.pause();
    if (previewTimer.current !== null) window.clearInterval(previewTimer.current);
  }, []);
  const ensureAudio = () => {
    if (!track?.webAudioUrl) return null;
    if (!audio.current || audio.current.src !== new URL(track.webAudioUrl, window.location.href).href) {
      audio.current?.pause();
      const next = new Audio(track.webAudioUrl);
      next.volume = volume;
      next.preload = 'metadata';
      next.ontimeupdate = () => setTime(next.currentTime);
      next.onloadedmetadata = () => setDuration(next.duration);
      next.onended = () => setPlaying(false);
      next.onerror = () => { setError('오디오를 불러올 수 없습니다.'); setPlaying(false); };
      audio.current = next;
    }
    return audio.current;
  };
  const select = async (index: number) => {
    audio.current?.pause();
    if (previewTimer.current !== null) window.clearInterval(previewTimer.current);
    previewTimer.current = null;
    setPlaying(false); setTime(0); setError(''); setSelected(index);
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

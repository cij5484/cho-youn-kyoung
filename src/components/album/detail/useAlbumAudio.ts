import { useEffect, useRef, useState } from 'react';
import type { AlbumTrack } from '../../../data/albums';

export function useAlbumAudio(tracks: AlbumTrack[]) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');
  const track = tracks[selected];

  useEffect(() => () => audio.current?.pause(), []);
  const ensureAudio = () => {
    if (!track?.webAudioUrl) return null;
    if (!audio.current || audio.current.src !== new URL(track.webAudioUrl, window.location.href).href) {
      audio.current?.pause();
      const next = new Audio(track.webAudioUrl);
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
    audio.current?.pause(); setPlaying(false); setTime(0); setError(''); setSelected(index);
  };
  const toggle = async () => {
    const element = ensureAudio();
    if (!element) return;
    if (playing) { element.pause(); setPlaying(false); return; }
    try { await element.play(); setPlaying(true); } catch { setError('재생을 시작할 수 없습니다.'); }
  };
  const seek = (value: number) => { if (audio.current) audio.current.currentTime = value; setTime(value); };
  const pause = () => { audio.current?.pause(); setPlaying(false); };
  return { selected, track, playing, time, duration, error, select, toggle, seek, pause, playable: Boolean(track?.webAudioUrl) };
}

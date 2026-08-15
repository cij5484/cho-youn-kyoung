import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Album } from '../../../data/albums';
import { assetUrl } from '../../../utils/assetUrl';
import { useAlbumAudio } from './useAlbumAudio';
import type { ExperienceMode } from './AlbumDetailExperience3D';

const Experience3D = lazy(() => import('./AlbumDetailExperience3D'));
const statusLabel = { 'coming-soon': 'COMING SOON', released: 'RELEASED' } as const;
const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
function canUseWebGL() { try { const canvas=document.createElement('canvas'); return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl')); } catch { return false; } }

export default function JiYoungHeeAlbumDetail({ album }: { album: Album }) {
  const [mode, setMode] = useState<ExperienceMode>('CLOSED');
  const [spread, setSpread] = useState(0); const [mobilePage, setMobilePage] = useState(0);
  const [mobile, setMobile] = useState(false); const [reduced, setReduced] = useState(false);
  const [webgl] = useState(canUseWebGL); const stage = useRef<HTMLElement>(null); const swipe = useRef<number | undefined>(undefined);
  const tracks = album.tracks ?? []; const player = useAlbumAudio(tracks); const pages = album.booklet?.previewImages ?? [];
  useEffect(() => { const mq=matchMedia('(max-width: 700px)'), rm=matchMedia('(prefers-reduced-motion: reduce)'); const update=()=>{setMobile(mq.matches);setReduced(rm.matches)}; update(); mq.addEventListener('change',update);rm.addEventListener('change',update);return()=>{mq.removeEventListener('change',update);rm.removeEventListener('change',update)}; },[]);
  const pageIndex = mobile ? mobilePage : spread * 2;
  const previous = () => mobile ? setMobilePage((v)=>Math.max(0,v-1)) : setSpread((v)=>Math.max(0,v-1));
  const next = () => mobile ? setMobilePage((v)=>Math.min(5,v+1)) : setSpread((v)=>Math.min(2,v+1));
  const openBooklet = () => { setSpread(0);setMobilePage(0);setMode('BOOKLET_FOCUS');stage.current?.scrollIntoView({behavior:reduced?'auto':'smooth'}); };
  const back = () => { player.pause();setMode('ALBUM_OPEN'); };
  useEffect(() => { if(mode!=='BOOKLET_FOCUS') return; const key=(e:KeyboardEvent)=>{if(e.key==='ArrowLeft')previous();if(e.key==='ArrowRight')next()};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key); });

  if (!webgl) return <article className="ji-detail ji-detail--fallback"><Link to="/works">← BACK TO WORKS</Link><img src={assetUrl(album.coverImage!)} alt={`${album.title} 앨범 커버`}/><h1>{album.title}</h1><p>ALBUM · {album.year}</p><Editorial album={album} onBooklet={()=>{}}/><section><h2>DIGITAL BOOKLET</h2><div className="ji-detail__fallback-grid">{pages.map(p=><img key={p.src} src={assetUrl(p.src)} alt={p.alt}/>)}</div></section></article>;
  return <article className={`ji-detail ji-detail--${mode.toLowerCase()}`}>
    <section className="ji-detail__stage" ref={stage} aria-label="지영희류 앨범 인터랙티브 전시">
      <picture className="ji-detail__background"><source media="(max-width:700px)" srcSet={assetUrl(album.albumHero!.background.mobile)}/><img src={assetUrl(album.albumHero!.background.desktop)} alt=""/></picture>
      <div className="ji-detail__canvas"><Suspense fallback={<p className="ji-detail__loading">3D 앨범을 준비하고 있습니다.</p>}><Experience3D album={album} mode={mode} page={pageIndex} playing={player.playing} reduced={reduced} onOpen={()=>setMode('ALBUM_OPEN')} onBooklet={openBooklet} onPlayer={()=>setMode('PLAYER_FOCUS')}/></Suspense></div>
      {mode==='CLOSED'&&<div className="ji-detail__intro"><Link to="/works" className="ji-detail__back">← BACK TO WORKS</Link><p>ALBUM · {album.year}</p><h1>조윤경 해금산조</h1><h2>지영희류</h2><p className="ji-detail__english">{album.englishTitle}</p>{album.releaseStatus&&<strong>{statusLabel[album.releaseStatus]}</strong>}<button onClick={()=>setMode('ALBUM_OPEN')}>OPEN ALBUM <span>→</span></button></div>}
      {mode==='ALBUM_OPEN'&&<div className="ji-detail__mode-actions"><button onClick={openBooklet}>BOOKLET</button><button onClick={()=>setMode('PLAYER_FOCUS')}>CD / TRACKS</button><button onClick={()=>setMode('CLOSED')}>CLOSE ALBUM</button></div>}
      {mode==='BOOKLET_FOCUS'&&<div className="ji-detail__booklet-ui" onTouchStart={e=>{swipe.current=e.touches[0].clientX}} onTouchEnd={e=>{if(swipe.current===undefined)return;const dx=e.changedTouches[0].clientX-swipe.current;if(Math.abs(dx)>45)(dx>0?previous:next)();swipe.current=undefined}}>
        <div className="ji-detail__pages" aria-live="polite">{mobile?<button onClick={next} disabled={mobilePage===5}><img src={assetUrl(pages[mobilePage+1].src)} alt={pages[mobilePage+1].alt}/></button>:<><button onClick={previous} disabled={spread===0}><img src={assetUrl(pages[spread*2+1].src)} alt={pages[spread*2+1].alt}/></button><button onClick={next} disabled={spread===2}><img src={assetUrl(pages[spread*2+2].src)} alt={pages[spread*2+2].alt}/></button></>}</div>
        <p>{mobile?`P${mobilePage+2} / P7`:`P${spread*2+2} — P${spread*2+3}`}</p><div className="ji-detail__booklet-controls"><button onClick={previous} disabled={pageIndex===0}>PREVIOUS</button><button onClick={back}>BACK TO ALBUM</button><button onClick={next} disabled={mobile?mobilePage===5:spread===2}>NEXT</button></div>
      </div>}
      {mode==='PLAYER_FOCUS'&&<div className="ji-detail__player"><p className="ji-detail__label">TRACKS</p><ol>{tracks.map((track,index)=><li key={track.number}><button onClick={()=>player.select(index)} aria-current={player.selected===index?'true':undefined}><span>{String(track.number).padStart(2,'0')}</span><strong>{track.title}</strong><time>{track.duration}</time></button></li>)}</ol><p className="ji-detail__selected">{String(player.track.number).padStart(2,'0')} · {player.track.title}</p><div className="ji-detail__transport"><button onClick={player.toggle} disabled={!player.playable}>{player.playing?'PAUSE':'PLAY'}</button><span>{formatTime(player.time)}</span><input aria-label="재생 위치" type="range" min="0" max={player.duration||1} value={player.time} onChange={e=>player.seek(Number(e.target.value))} disabled={!player.playable}/><span>{player.track.duration??formatTime(player.duration)}</span></div>{!player.playable&&<p className="ji-detail__audio-status">AUDIO COMING SOON</p>}{player.error&&<p role="status">{player.error}</p>}<button className="ji-detail__player-back" onClick={back}>BACK TO ALBUM</button></div>}
    </section><Editorial album={album} onBooklet={openBooklet}/>
  </article>;
}

function Editorial({album,onBooklet}:{album:Album;onBooklet():void}) { return <div className="ji-detail__editorial">
  {album.tracks?.length&&<section><h2>TRACKS</h2><ol>{album.tracks.map(t=><li key={t.number}><span>{String(t.number).padStart(2,'0')}</span><strong>{t.title}</strong><time>{t.duration}</time></li>)}</ol></section>}
  {album.credits?.length&&<section><h2>CREDITS</h2><dl>{album.credits.map(c=><div key={c.role}><dt>{c.role}</dt><dd>{c.names.join(' · ')}</dd></div>)}</dl></section>}
  {album.booklet?.previewImages.length&&<section><h2>DIGITAL BOOKLET</h2><div><p>P1—P7 · DESKTOP SPREAD / MOBILE PAGE VIEW</p><button onClick={onBooklet}>OPEN BOOKLET →</button></div></section>}
  <Link className="ji-detail__works" to="/works">← BACK TO WORKS</Link></div>; }

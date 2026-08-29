import { Link } from 'react-router-dom';
import type { HomeHeroSlide } from '../../data/homeHeroSlides';
import { assetUrl } from '../../utils/assetUrl';
import '../../styles/haegeum-jeongak-hero.css';

export function HaegeumJeongakHero({ slide, isActive }: { slide: HomeHeroSlide; isActive: boolean }) {
  return (
    <section className="hj-hero" aria-labelledby={`${slide.id}-hero-title`}>
      <picture className="hj-hero__picture" aria-hidden="true">
        {slide.heroImageMobile && <source media="(max-width: 700px)" srcSet={assetUrl(slide.heroImageMobile)} />}
        <img src={assetUrl(slide.heroImage ?? '')} alt="" decoding="async" />
      </picture>
      <div className="hj-hero__copy" key={isActive ? `${slide.id}-active` : slide.id}>
        <p className="hj-hero__eyebrow">HAEGEUM JEONGAK</p>
        <h1 id={`${slide.id}-hero-title`}>풀고, 엮다</h1>
        <p className="hj-hero__subtitle"><span>조윤경의 해금정악</span><span>해금상령산풀이 · 관악영산회상</span></p>
        <div className="hj-hero__event">
          <time className="hj-hero__date" dateTime="2026-09-22"><strong>22</strong><span>SEP</span><span>2026</span></time>
          <div className="hj-hero__event-meta"><p>19:30</p><p>국립부산국악원 예지당</p></div>
        </div>
        <Link className="hj-hero__link" to={slide.detailLink}>VIEW PERFORMANCE <span aria-hidden="true">→</span></Link>
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';
import { SafeImage } from '../components/common/SafeImage';
import { Reveal } from '../components/Reveal';
import { profile } from '../data/profile';
import { assetUrl } from '../utils/assetUrl';
import '../styles/about.css';

export function AboutPage() {
  const featuredAlbum = profile.discography[0];
  return (
    <article className="about-page">
      <section className="about-hero" aria-labelledby="about-title">
        <div className="about-hero__copy">
          <p className="about-kicker">ABOUT</p>
          <h1 id="about-title">{profile.englishName}</h1>
          <p className="about-hero__role">{profile.role}</p>
          <p className="about-hero__position">{profile.currentPosition}</p>
        </div>
        <figure className="about-hero__portrait">
          <SafeImage src={assetUrl(profile.profileImage)} alt={`${profile.name} 공식 프로필 사진`} fallbackClassName="about-hero__portrait-fallback" fallbackLabel={profile.englishName} objectPosition="center bottom" />
        </figure>
      </section>

      <div className="about-body">
        <Reveal as="section" className="about-section about-bio" aria-labelledby="biography-title">
          <div className="about-section__heading reveal__heading">
            <span>01</span>
            <h2 id="biography-title">BIOGRAPHY</h2>
          </div>
          <div className="about-bio__grid reveal__content">
            <div className="about-prose">
              {profile.biography.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <aside className="about-facts" aria-label="학력 및 현재 활동">
              <div>
                <h3>EDUCATION</h3>
                <ul>
                  {profile.education.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>CURRENT POSITION</h3>
                {profile.positions.slice(0, 3).map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </aside>
          </div>
        </Reveal>

        <Reveal as="section" className="about-section" aria-labelledby="timeline-title">
          <div className="about-section__heading reveal__heading">
            <span>02</span>
            <h2 id="timeline-title">CAREER TIMELINE</h2>
          </div>
          <div className="about-timeline reveal__content">
            {profile.performances.map((item) => {
              const content = (
                <>
                  <time>{item.year}</time>
                  <div>
                    <h3>「{item.title}」</h3>
                    {item.description && <p>{item.description}</p>}
                  </div>
                </>
              );

              return item.href ? (
                <Link className="about-timeline__item about-timeline__item--link" to={item.href} key={`${item.year}-${item.title}`}>
                  {content}
                </Link>
              ) : (
                <article className="about-timeline__item" key={`${item.year}-${item.title}`}>
                  {content}
                </article>
              );
            })}
          </div>
          <details className="about-more">
            <summary>전체 경력 보기</summary>
            <div className="about-more__grid">
              <div>
                <h3>AWARDS</h3>
                <ul>{profile.awards.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
              <div>
                <h3>POSITIONS</h3>
                <ul>{profile.positions.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            </div>
          </details>
        </Reveal>

        {featuredAlbum && (
          <Reveal as="section" className="about-section about-discography" aria-labelledby="discography-title">
            <div className="about-section__heading reveal__heading">
              <span>03</span>
              <h2 id="discography-title">DISCOGRAPHY</h2>
            </div>
            <div className={`about-discography__item reveal__content${featuredAlbum.coverImage ? " has-cover" : ""}`}>
              {featuredAlbum.coverImage && <SafeImage src={assetUrl(featuredAlbum.coverImage)} alt={`${featuredAlbum.title} 앨범 커버`} />}
              <div>
                <p>{featuredAlbum.year}</p>
                <h3>「{featuredAlbum.title}」</h3>
                <span>{featuredAlbum.description}</span>
                {featuredAlbum.detailsPath && <Link to={featuredAlbum.detailsPath}>VIEW DETAILS</Link>}
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </article>
  );
}

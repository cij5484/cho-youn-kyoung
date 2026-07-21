import { Link, useParams } from 'react-router-dom';
import { performances } from '../data/performances';
import '../styles/performance-detail.css';

export function PerformanceDetailPage() {
  const { id } = useParams();
  const performance = performances.find((item) => item.id === id);

  if (!performance) {
    return (
      <section className="page-shell">
        <h1>Performance not found</h1>
        <Link className="text-link" to="/performance">
          Back to performance
        </Link>
      </section>
    );
  }

  const hasArchiveLinks = Boolean(performance.posterUrl || performance.leafletUrl);

  return (
    <article className="performance-detail">
      <section className="performance-detail__hero" aria-labelledby="performance-title">
        <div className="performance-detail__hero-media" aria-hidden="true">
          <img src={performance.heroImage} alt="" />
        </div>
        <div className="performance-detail__hero-content">
          <p className="performance-detail__eyebrow">{performance.archiveLabel}</p>
          <h1 id="performance-title">{performance.title}</h1>
          <p className="performance-detail__subtitle">{performance.subtitle}</p>
          <dl className="performance-detail__meta" aria-label="공연 기본 정보">
            <div>
              <dt>일시</dt>
              <dd>{performance.displayDate}</dd>
            </div>
            <div>
              <dt>장소</dt>
              <dd>{performance.venue}</dd>
            </div>
            <div>
              <dt>연주</dt>
              <dd>{performance.performer}</dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="performance-detail__body">
        <section className="performance-detail__section performance-detail__intro" aria-labelledby="intro-title">
          <div className="performance-detail__section-heading">
            <span>01</span>
            <h2 id="intro-title">공연 소개</h2>
          </div>
          <div className="performance-detail__prose">
            {performance.introduction.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className="performance-detail__section performance-detail__note" aria-labelledby="note-title">
          <div className="performance-detail__section-heading">
            <span>02</span>
            <h2 id="note-title">연주자의 말</h2>
          </div>
          <div className="performance-detail__prose">
            {performance.artistNote.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p className="performance-detail__signature">{performance.artistSignature}</p>
          </div>
        </section>

        <section className="performance-detail__section" aria-labelledby="program-title">
          <div className="performance-detail__section-heading">
            <span>03</span>
            <h2 id="program-title">프로그램 시대 구분</h2>
          </div>
          <div className="performance-detail__eras">
            {performance.programEras.map((era) => (
              <section className="performance-detail__era" key={era.title}>
                <div className="performance-detail__era-heading">
                  <span>{era.roman}</span>
                  <div>
                    <h3>{era.title}</h3>
                    <p>{era.description}</p>
                  </div>
                </div>
                <div className="performance-detail__works">
                  {era.works.map((work) => (
                    <article className="performance-detail__work" key={`${work.number}-${work.title}`}>
                      <div className="performance-detail__work-title">
                        <span>{String(work.number).padStart(2, '0')}</span>
                        <div>
                          <p>{work.year}</p>
                          <h4>
                            {work.composer}({work.composerYears}) 「{work.title}」
                          </h4>
                          {work.instrumentation && (
                            <ul aria-label="협연 및 편성">
                              {work.instrumentation.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                      <div className="performance-detail__commentary">
                        <div>
                          <h5>작곡가</h5>
                          <p>{work.composerNote}</p>
                        </div>
                        <div>
                          <h5>작품해설</h5>
                          <p>{work.workNote}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>

        <section className="performance-detail__section" aria-labelledby="collaborator-title">
          <div className="performance-detail__section-heading">
            <span>04</span>
            <h2 id="collaborator-title">함께한 연주자</h2>
          </div>
          <div className="performance-detail__collaborators">
            {performance.collaborators.map((collaborator) => (
              <article className="performance-detail__collaborator" key={collaborator.name}>
                <p>{collaborator.role}</p>
                <h3>{collaborator.name}</h3>
                <ul>
                  {collaborator.bio.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {hasArchiveLinks && (
          <section className="performance-detail__section performance-detail__materials" aria-labelledby="materials-title">
            <div className="performance-detail__section-heading">
              <span>05</span>
              <h2 id="materials-title">포스터·리플렛</h2>
            </div>
            <div className="performance-detail__material-links">
              {performance.posterUrl && <a href={performance.posterUrl}>포스터 보기</a>}
              {performance.leafletUrl && <a href={performance.leafletUrl}>리플렛 보기</a>}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

import { Reveal } from '../components/Reveal';
import { site } from '../data/site';

const contactItems = [
  {
    label: 'EMAIL',
    value: site.contactEmail,
    href: `mailto:${site.contactEmail}`,
    ariaLabel: `${site.contactEmail}로 이메일 보내기`,
    external: false,
  },
  {
    label: 'INSTAGRAM',
    value: site.instagramHandle,
    href: site.instagramUrl,
    ariaLabel: `${site.instagramHandle} 인스타그램을 새 창에서 열기`,
    external: true,
  },
  {
    label: 'INQUIRIES',
    value: site.inquiries,
  },
  {
    label: 'AFFILIATION',
    value: site.affiliation,
  },
] as const;

export function ContactPage() {
  return (
    <Reveal as="section" className="page-shell contact-page" aria-labelledby="contact-title">
      <div className="contact-page__intro reveal__heading">
        <p className="section-label">OFFICIAL CONTACT</p>
        <h1 id="contact-title" className="page-title">CONTACT</h1>
        <p>공연, 협업 및 공식 문의는 아래 연락처를 통해 전해 주세요.</p>
      </div>

      <dl className="contact-page__list reveal__content">
        {contactItems.map((item) => (
          <div className="contact-page__item" key={item.label}>
            <dt>{item.label}</dt>
            <dd>
              {'href' in item ? (
                <a
                  className="contact-page__link"
                  href={item.href}
                  aria-label={item.ariaLabel}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                >
                  {item.value}
                </a>
              ) : (
                <span>{item.value}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </Reveal>
  );
}

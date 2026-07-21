import { Reveal } from '../components/Reveal';
import { site } from '../data/site';

export function ContactPage() {
  return <Reveal as="section" className="page-shell" aria-labelledby="contact-title"><p className="section-label reveal__heading">CONTACT</p><div className="reveal__content"><h1 id="contact-title">Contact</h1>{site.contactEmail ? <a className="text-link" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> : <p className="muted">연락처 정보는 준비 중입니다.</p>}</div></Reveal>;
}

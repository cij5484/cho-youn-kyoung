import { site } from '../data/site';

export function ContactPage() {
  return <section className="page-shell"><p className="section-label">CONTACT</p><h1>Contact</h1>{site.contactEmail ? <a className="text-link" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> : <p className="muted">연락처 정보는 준비 중입니다.</p>}</section>;
}

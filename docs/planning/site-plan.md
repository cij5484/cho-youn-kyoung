# Site Plan

## Project goal
Build the official website and expandable performance archive for haegeum artist **CHO YOUN KYOUNG**.

The first release focuses only on the recital **해금, 시대를 잇다** on 2026. 8. 2. Later performances and albums must be addable through structured data without redesigning the site.

## Navigation
- HOME
- PERFORMANCE
- ABOUT
- CONTACT
- DISCOGRAPHY: hidden until album content is ready

## Initial pages

### HOME
- Full-screen watercolor hero
- Featured performance
- Program timeline preview
- Short artist profile
- Email contact

### PERFORMANCE
- Expandable performance archive
- Initially one performance card
- Future performances appear automatically when data is added

### PERFORMANCE DETAIL
- Performance introduction
- Artist's note
- Six-program timeline
- Composer and work notes
- Collaborating artists and host
- Leaflet JPG preview
- PDF viewer link
- Venue information

### ABOUT
- Artist introduction
- Education
- Career and awards
- Solo recital history
- Discography
- Current affiliation

### CONTACT
- Email only
- No phone number, address, form, or server-side processing

## Featured content logic
Use a mixed featured-content rule:
1. A performance or album marked `featured: true` is shown in the hero.
2. Without a featured item, use the nearest upcoming performance.
3. Later, albums can also be selected as the hero content.

## Update model
Content is stored in TypeScript data files. Adding one performance or album record automatically creates its list card and detail route.

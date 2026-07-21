export type Album = {
  id: string;
  title: string;
  year: string;
  description: string;
  coverImage?: string;
  detailsPath?: string;
  featured?: boolean;
};

export const albums: Album[] = [
  {
    id: 'han-beom-su-haegeum-sanjo-2020',
    title: '조윤경 해금산조－한범수류',
    year: '2020',
    description: '한범수류 해금산조의 결을 담은 조윤경의 산조 음반.',
    featured: true,
  },
];

export type Album = {
  id: string;
  title: string;
  releaseDate?: string;
  featured?: boolean;
};

export const albums: Album[] = [];

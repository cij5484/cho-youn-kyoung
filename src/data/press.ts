export type PressArticle = {
  id: string;
  outlet: string;
  publishedDate: string;
  title: string;
  shortDescription?: string;
  url: string;
  category?: 'NEWS' | 'INTERVIEW' | 'REVIEW';
  label?: string;
};

// Add only articles whose outlet, title, date, and canonical URL are verified.
export const pressArticles: PressArticle[] = [];

export const pressArticlesNewestFirst = [...pressArticles].sort((a, b) =>
  b.publishedDate.localeCompare(a.publishedDate),
);

import { FilterState } from '@/types/mdx';

export const QUERY_KEY = {
  FILTERS: ['filters'],
  POSTS: (filters: FilterState & { perPage?: number }) => ['posts', filters],
  SEARCH_INDEX: ['search-index']
};

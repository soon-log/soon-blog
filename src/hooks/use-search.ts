import { useSuspenseQuery } from '@tanstack/react-query';
import lunr from 'lunr';
import { useState, useEffect, useCallback } from 'react';

import { QUERY_KEY } from '@/constants/query-key';
import { buildAbsoluteUrl } from '@/lib/http';
import { createEnhancedSearchQueries } from '@/lib/search';
import { SearchResult, SearchIndexData } from '@/types/mdx';

interface UseSearchResult {
  query: string;
  setQuery: (query: string) => void;
  results: Array<SearchResult>;
  isLoading: boolean;
  error: Error | null;
}

const fetchSearchIndex = async () => {
  const response = await fetch(buildAbsoluteUrl('/data/lunr-index.json'));

  if (!response.ok) {
    throw new Error(`검색 인덱스 로드 실패: ${response.status}`);
  }

  const data: SearchIndexData = await response.json();

  return {
    index: lunr.Index.load(data.index),
    store: data.store
  };
};

export function useSearch(): UseSearchResult {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<SearchResult>>([]);

  const { data, isLoading, error } = useSuspenseQuery({
    queryKey: QUERY_KEY.SEARCH_INDEX,
    queryFn: fetchSearchIndex
  });
  const { index: searchIndex, store: searchStore } = data;

  const performSearch = useCallback(
    (searchQuery: string) => {
      if (!searchIndex || !searchQuery.trim()) {
        setResults([]);
        return;
      }

      try {
        const allResults: Array<lunr.Index.Result> = [];
        const seenResults = new Set<string>();

        // 한글 지원 검색 쿼리 생성
        const searchQueries = createEnhancedSearchQueries(searchQuery);

        // 각 쿼리로 검색 실행
        for (const [index, queryString] of searchQueries.entries()) {
          try {
            const searchResults = searchIndex.search(queryString);
            console.log(`🎯 쿼리 "${queryString}":`, searchResults.length, '개 결과');

            searchResults.forEach((result) => {
              if (!seenResults.has(result.ref)) {
                seenResults.add(result.ref);
                // 첫 번째 쿼리(원본)가 아닌 경우 점수 조정
                if (index > 0) {
                  result.score *= 0.8 - index * 0.1; // 점수 감소
                }
                allResults.push(result);
              }
            });
          } catch (searchError) {
            console.log(`❌ 쿼리 "${queryString}" 검색 실패:`, searchError);
          }
        }

        // 점수순으로 정렬
        allResults.sort((a, b) => b.score - a.score);

        console.log('✅ 최종 결과:', allResults.length, '개');

        // 검색 결과를 실제 게시물 데이터에 매핑
        const mappedResults: SearchResult[] = allResults
          .slice(0, 10) // 상위 10개만
          .map((result) => {
            const post = searchStore[result.ref];
            return {
              key: post.key,
              title: post.title,
              summary: post.summary,
              tags: post.tags || [],
              category: post.category,
              date: post.date,
              score: result.score
            };
          });

        setResults(mappedResults);
      } catch (error) {
        console.error('검색 오류:', error);
        setResults([]);
      }
    },
    [searchIndex, searchStore]
  );

  // 쿼리 변경 시 검색 실행
  useEffect(() => {
    performSearch(query);
  }, [query, performSearch]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error
  };
}

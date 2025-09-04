'use client';

import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSearch } from '@/hooks/use-search';
import { SearchResult } from '@/types/mdx';

const BLUR_TIMEOUT_MS = 200; // 결과 클릭 처리를 위한 지연 시간
const MAX_DROPDOWN_RESULTS = 10; // 드롭다운에 표시할 최대 결과 수
const MAX_DISPLAY_TAGS = 3; // 표시할 최대 태그 수

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  onResultSelect?: (result: SearchResult) => void;
}

export function SearchBar({
  className = '',
  placeholder = '검색어를 입력하세요...',
  onResultSelect
}: SearchBarProps) {
  const router = useRouter();
  const { query, setQuery, results, isLoading, error } = useSearch();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // 검색어나 결과가 있을 때만 드롭다운 표시
  useEffect(() => {
    setIsOpen(query.trim().length > 0);
    setSelectedIndex(-1);
  }, [query, results]);

  // 검색 페이지로 이동하는 함수
  const navigateToSearchPage = (searchQuery: string) => {
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    setIsOpen(false);
  };

  // 검색 결과 선택 처리
  const handleResultSelect = (result: SearchResult) => {
    if (onResultSelect) {
      onResultSelect(result);
    } else {
      // 기본 동작: 포스트 페이지로 이동
      router.push(`/post/${result.key}`);
    }

    // 상태 초기화
    setIsOpen(false);
    setQuery('');
    inputRef.current?.blur();
  };

  // 키보드 이벤트 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'Enter' && query.trim()) {
        navigateToSearchPage(query);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;

      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultSelect(results[selectedIndex]);
        } else if (query.trim()) {
          navigateToSearchPage(query);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // 입력 필드 포커스 아웃 처리
  const handleBlur = () => {
    // 결과 클릭 이벤트가 처리될 수 있도록 약간의 지연 추가
    setTimeout(() => {
      setIsOpen(false);
      setSelectedIndex(-1);
    }, BLUR_TIMEOUT_MS);
  };

  // 검색어 클리어
  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // 포커스 처리
  const handleFocus = () => {
    if (query.trim()) {
      setIsOpen(true);
    }
  };

  // 결과 호버 처리
  const handleResultHover = (index: number) => {
    setSelectedIndex(index);
  };

  // 모든 결과 보기 처리
  const handleShowAllResults = () => {
    navigateToSearchPage(query);
  };

  return (
    <div className={`relative ${className}`}>
      <SearchInput
        value={query}
        placeholder={placeholder}
        onChange={setQuery}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClear={handleClear}
        isOpen={isOpen}
        inputRef={inputRef}
      />

      <SearchResultsDropdown
        isOpen={isOpen}
        isLoading={isLoading}
        error={error}
        results={results}
        query={query}
        selectedIndex={selectedIndex}
        onResultClick={handleResultSelect}
        onResultHover={handleResultHover}
        onShowAllResults={handleShowAllResults}
        resultsRef={resultsRef}
      />
    </div>
  );
}

interface SearchInputProps {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
  onClear: () => void;
  isOpen: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

function SearchInput({
  value,
  placeholder,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
  onClear,
  isOpen,
  inputRef
}: SearchInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        className="focus-visible:ring-ring placeholder:text-muted-foreground pl-10 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        aria-label="검색"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-autocomplete="list"
        role="combobox"
      />

      {value && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 p-0"
          onClick={onClear}
          aria-label="검색어 초기화"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

interface SearchResultsDropdownProps {
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  results: Array<SearchResult>;
  query: string;
  selectedIndex: number;
  onResultClick: (result: SearchResult) => void;
  onResultHover: (index: number) => void;
  onShowAllResults: () => void;
  resultsRef: React.RefObject<HTMLDivElement | null>;
}

function SearchResultsDropdown({
  isOpen,
  isLoading,
  error,
  results,
  query,
  selectedIndex,
  onResultClick,
  onResultHover,
  onShowAllResults,
  resultsRef
}: SearchResultsDropdownProps) {
  if (!isOpen) return null;

  return (
    <div
      ref={resultsRef}
      className="bg-popover absolute top-full z-50 mt-1 w-full rounded-md border shadow-md"
      role="listbox"
      aria-label="검색 결과"
    >
      {isLoading ? (
        <div className="text-muted-foreground p-4 text-center text-sm">검색 중...</div>
      ) : error ? (
        <div className="text-destructive p-4 text-center text-sm">{error}</div>
      ) : results.length > 0 ? (
        <div className="max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <div
              key={result.key}
              role="option"
              aria-selected={index === selectedIndex}
              aria-label={result.title}
              className={`border-border hover:bg-muted cursor-pointer border-b p-3 last:border-b-0 ${
                index === selectedIndex ? 'bg-muted' : ''
              }`}
              onClick={() => onResultClick(result)}
              onMouseEnter={() => onResultHover(index)}
            >
              <div className="text-sm font-medium">{result.title}</div>
              {result.summary && (
                <div className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                  {result.summary}
                </div>
              )}
              <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
                {result.category && (
                  <span className="bg-secondary rounded px-1.5 py-0.5">{result.category}</span>
                )}
                {result.tags && result.tags.length > 0 && (
                  <span className="flex gap-1">
                    {result.tags.slice(0, MAX_DISPLAY_TAGS).map((tag) => (
                      <span key={tag} className="text-xs">
                        #{tag}
                      </span>
                    ))}
                  </span>
                )}
              </div>
            </div>
          ))}

          {results.length >= MAX_DROPDOWN_RESULTS && (
            <div
              className="bg-muted/50 hover:bg-muted cursor-pointer border-t p-3 text-center text-sm"
              onClick={onShowAllResults}
            >
              모든 검색 결과 보기 →
            </div>
          )}
        </div>
      ) : query.trim() ? (
        <div className="text-muted-foreground p-4 text-center text-sm">검색 결과가 없습니다</div>
      ) : null}
    </div>
  );
}

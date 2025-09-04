/**
 * 한영 오타, 초성 검색, 접두사 검색을 지원하는 고기능 검색 쿼리 변환 함수
 * @param query - 사용자 입력 검색어
 * @returns 변환된 검색 쿼리 Set
 */
export function createEnhancedSearchQueries(query: string): string[] {
  if (!query || query.trim() === '') {
    return [];
  }

  const normalizedQuery = query.trim().toLowerCase();
  const queries = new Set<string>();

  // 1. 기본 쿼리 추가 (정규화된 원본)
  queries.add(normalizedQuery);

  // 2. 구문 검색 쿼리 추가 (공백이 있을 경우)
  if (normalizedQuery.includes(' ')) {
    queries.add(`"${normalizedQuery}"`);
  }

  // 3. 접두사(Prefix) 검색을 위한 와일드카드 쿼리 추가
  queries.add(`${normalizedQuery}*`);

  // 4. 한영 오타 변환 쿼리 생성
  const korTypoQuery = convertEngToKor(normalizedQuery);
  if (korTypoQuery !== normalizedQuery) {
    queries.add(korTypoQuery);
    queries.add(`${korTypoQuery}*`); // 변환된 한글 쿼리에도 와일드카드 추가
  }

  // 5. 초성 검색 쿼리 생성
  // 원본 쿼리와 한영 오타 변환 쿼리 모두에 대해 초성 쿼리를 생성
  const initialConsonants = getInitialConsonants(normalizedQuery);
  if (initialConsonants.length > 0 && initialConsonants !== normalizedQuery) {
    queries.add(initialConsonants);
  }
  const typoInitialConsonants = getInitialConsonants(korTypoQuery);
  if (typoInitialConsonants.length > 0 && typoInitialConsonants !== korTypoQuery) {
    queries.add(typoInitialConsonants);
  }

  return [...queries];
}

// --- Helper Functions ---

const ENG_TO_KOR_MAP: Record<string, string> = {
  q: 'ㅂ',
  w: 'ㅈ',
  e: 'ㄷ',
  r: 'ㄱ',
  t: 'ㅅ',
  y: 'ㅛ',
  u: 'ㅕ',
  i: 'ㅑ',
  o: 'ㅐ',
  p: 'ㅔ',
  a: 'ㅁ',
  s: 'ㄴ',
  d: 'ㅇ',
  f: 'ㄹ',
  g: 'ㅎ',
  h: 'ㅗ',
  j: 'ㅓ',
  k: 'ㅏ',
  l: 'ㅣ',
  z: 'ㅋ',
  x: 'ㅌ',
  c: 'ㅊ',
  v: 'ㅍ',
  b: 'ㅠ',
  n: 'ㅜ',
  m: 'ㅡ',
  Q: 'ㅃ',
  W: 'ㅉ',
  E: 'ㄸ',
  R: 'ㄲ',
  T: 'ㅆ',
  O: 'ㅒ',
  P: 'ㅖ'
};

/** 영어 키보드로 입력된 문자열을 한글로 변환 */
function convertEngToKor(eng: string): string {
  let kor = '';
  for (const char of eng) {
    kor += ENG_TO_KOR_MAP[char] || char;
  }
  return kor;
}

/** 한글 문자열을 초성으로 변환 */
function getInitialConsonants(str: string): string {
  const CHO = [
    'ㄱ',
    'ㄲ',
    'ㄴ',
    'ㄷ',
    'ㄸ',
    'ㄹ',
    'ㅁ',
    'ㅂ',
    'ㅃ',
    'ㅅ',
    'ㅆ',
    'ㅇ',
    'ㅈ',
    'ㅉ',
    'ㅊ',
    'ㅋ',
    'ㅌ',
    'ㅍ',
    'ㅎ'
  ];
  let result = '';
  for (const char of str) {
    const code = char.charCodeAt(0) - 44032; // '가'의 유니코드
    if (code >= 0 && code <= 11171) {
      const choIndex = Math.floor(code / 588);
      result += CHO[choIndex];
    } else {
      result += char; // 한글이 아니면 원본 문자 추가
    }
  }
  return result;
}

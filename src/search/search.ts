import { decode } from 'html-entities';
import { NewsResult } from './news';
import { VideoResult } from './videos';
import needle, { NeedleOptions } from 'needle';

import {
  CallbackDuckbarPayload,
  CallbackNextSearch,
  CallbackSearchResult,
  DuckbarImageResult,
  DuckbarNewsResult,
  DuckbarRelatedSearch,
  DuckbarVideoResult
} from '../types';
import {
  ensureJSON,
  getVQD,
  queryString,
  SafeSearchType,
  SearchTimeType
} from '../util';

export const COMMON_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/119.0.0.0 Safari/537.36',
  'Referer': 'https://duckduckgo.com/',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept': 'text/html',
  'DNT': '1',
  'Connection': 'keep-alive'
};

export interface SearchOptions {
  safeSearch?: SafeSearchType;
  time?: SearchTimeType | string;
  locale?: string;
  region?: string;
  marketRegion?: string;
  offset?: number;
  vqd?: string;
}

const defaultOptions: SearchOptions = {
  safeSearch: SafeSearchType.OFF,
  time: SearchTimeType.ALL,
  locale: 'en-us',
  region: 'wt-wt',
  offset: 0,
  marketRegion: 'en-US'
};

const SEARCH_REGEX = /DDG\.pageLayout\.load\('d',(\[.+\])\);DDG\.duckbar\.load(?:Module)?\('/;
const IMAGES_REGEX = /;DDG\.duckbar\.load\('images', ({"ads":.+"vqd":{".+":"\d-\d+-\d+"}})\);DDG\.duckbar\.load\('news/;
const NEWS_REGEX = /;DDG\.duckbar\.load\('news', ({"ads":.+"vqd":{".+":"\d-\d+-\d+"}})\);DDG\.duckbar\.load\('videos/;
const VIDEOS_REGEX = /;DDG\.duckbar\.load\('videos', ({"ads":.+"vqd":{".+":"\d-\d+-\d+"}})\);DDG\.duckbar\.loadModule\('related_searches/;
const RELATED_SEARCHES_REGEX = /DDG\.duckbar\.loadModule\('related_searches', ({"ads":.+"vqd":{".+":"\d-\d+-\d+"}})\);DDG\.duckbar\.load\('products/;

export interface SearchResults {
  noResults: boolean;
  vqd: string;
  results: SearchResult[];
  images?: DuckbarImageResult[];
  news?: NewsResult[];
  videos?: VideoResult[];
  related?: RelatedResult[];
}

export interface SearchResult {
  hostname: string;
  url: string;
  title: string;
  description: string;
  rawDescription: string;
  icon: string;
  bang?: SearchResultBang;
}

export interface SearchResultBang {
  prefix: string;
  title: string;
  domain: string;
}

export interface RelatedResult {
  text: string;
  raw: string;
}

export async function search(query: string, options?: SearchOptions, needleOptions?: NeedleOptions): Promise<SearchResults> {
  if (!query) throw new Error('Query cannot be empty!');
  if (!options) options = defaultOptions;
  else options = sanityCheck(options);

  let vqd = options.vqd!;
  if (!vqd) {
    vqd = await getVQD(query, 'web', { headers: COMMON_HEADERS });
    await new Promise(r => setTimeout(r, 1500)); // Add delay to reduce risk of block
  }

  const queryObject: Record<string, string> = {
    q: query,
    ...(options.safeSearch !== SafeSearchType.STRICT ? { t: 'D' } : {}),
    l: options.locale!,
    ...(options.safeSearch === SafeSearchType.STRICT ? { p: '1' } : {}),
    kl: options.region || 'wt-wt',
    s: String(options.offset),
    dl: 'en',
    ct: 'US',
    bing_market: options.marketRegion!,
    df: options.time! as string,
    vqd,
    ...(options.safeSearch !== SafeSearchType.STRICT ? { ex: String(options.safeSearch) } : {}),
    sp: '1',
    bpa: '1',
    biaexp: 'b',
    msvrtexp: 'b',
    ...(options.safeSearch === SafeSearchType.STRICT
      ? {
        videxp: 'a',
        nadse: 'b',
        eclsexp: 'a',
        stiaexp: 'a',
        tjsexp: 'b',
        related: 'b',
        msnexp: 'a'
      }
      : {
        nadse: 'b',
        eclsexp: 'b',
        tjsexp: 'b'
      })
  };

  const response = await needle('get', `https://links.duckduckgo.com/d.js?${queryString(queryObject)}`, {
    ...(needleOptions || {}),
    headers: { ...COMMON_HEADERS }
  });

  const body = response.body.toString();
  if (body.includes('DDG.deep.is506')) throw new Error('A server error occurred!');
  if (body.includes('DDG.deep.anomalyDetectionBlock')) {
    console.error('🛑 DDG Anomaly Detected — response preview:', body.slice(0, 400));
    throw new Error('DDG detected an anomaly in the request, you are likely making requests too quickly.');
  }

  const searchResults = JSON.parse(SEARCH_REGEX.exec(body)![1].replace(/\t/g, '    ')) as (CallbackSearchResult | CallbackNextSearch)[];

  if (searchResults.length === 1 && !('n' in searchResults[0])) {
    const onlyResult = searchResults[0] as CallbackSearchResult;
    if ((!onlyResult.da && onlyResult.t === 'EOF') || !onlyResult.a || onlyResult.d === 'google.com search') {
      return {
        noResults: true,
        vqd,
        results: []
      };
    }
  }

  const results: SearchResults = {
    noResults: false,
    vqd,
    results: []
  };

  for (const search of searchResults) {
    if ('n' in search) continue;
    let bang: SearchResultBang | undefined;
    if (search.b) {
      const [prefix, title, domain] = search.b.split('\t');
      bang = { prefix, title, domain };
    }
    results.results.push({
      title: search.t,
      description: decode(search.a),
      rawDescription: search.a,
      hostname: search.i,
      icon: `https://external-content.duckduckgo.com/ip3/${search.i}.ico`,
      url: search.u,
      bang
    });
  }

  const imagesMatch = IMAGES_REGEX.exec(body);
  if (imagesMatch) {
    const imagesResult = JSON.parse(imagesMatch[1].replace(/\t/g, '    ')) as CallbackDuckbarPayload<DuckbarImageResult>;
    results.images = imagesResult.results.map((i) => {
      i.title = decode(i.title);
      return i;
    });
  }

  const newsMatch = NEWS_REGEX.exec(body);
  if (newsMatch) {
    const newsResult = JSON.parse(newsMatch[1].replace(/\t/g, '    ')) as CallbackDuckbarPayload<DuckbarNewsResult>;
    results.news = newsResult.results.map((article) => ({
      date: article.date,
      excerpt: decode(article.excerpt),
      image: article.image,
      relativeTime: article.relative_time,
      syndicate: article.syndicate,
      title: decode(article.title),
      url: article.url,
      isOld: !!article.is_old
    }));
  }

  const videosMatch = VIDEOS_REGEX.exec(body);
  if (videosMatch) {
    const videoResult = JSON.parse(videosMatch[1].replace(/\t/g, '    ')) as CallbackDuckbarPayload<DuckbarVideoResult>;
    results.videos = [];
    for (const video of videoResult.results) {
      results.videos.push({
        url: video.content,
        title: decode(video.title),
        description: decode(video.description),
        image: video.images.large || video.images.medium || video.images.small || video.images.motion,
        duration: video.duration,
        publishedOn: video.publisher,
        published: video.published,
        publisher: video.uploader,
        viewCount: video.statistics.viewCount || undefined
      });
    }
  }

  const relatedMatch = RELATED_SEARCHES_REGEX.exec(body);
  if (relatedMatch) {
    const relatedResult = JSON.parse(relatedMatch[1].replace(/\t/g, '    ')) as CallbackDuckbarPayload<DuckbarRelatedSearch>;
    results.related = [];
    for (const related of relatedResult.results) {
      results.related.push({
        text: related.text,
        raw: related.display_text
      });
    }
  }

  return results;
}

function sanityCheck(options: SearchOptions) {
  options = Object.assign({}, defaultOptions, options);

  if (!(options.safeSearch! in SafeSearchType)) throw new TypeError(`${options.safeSearch} is an invalid safe search type!`);
  if (typeof options.safeSearch! === 'string') options.safeSearch = SafeSearchType[options.safeSearch!] as any as SafeSearchType;
  if (typeof options.offset !== 'number') throw new TypeError(`Search offset is not a number!`);
  if (options.offset! < 0) throw new RangeError('Search offset cannot be below zero!');

  if (
    options.time &&
    !Object.values(SearchTimeType).includes(options.time as SearchTimeType) &&
    !/\d{4}-\d{2}-\d{2}..\d{4}-\d{2}-\d{2}/.test(options.time as string)
  )
    throw new TypeError(`${options.time} is an invalid search time!`);

  if (!options.locale || typeof options.locale! !== 'string') throw new TypeError('Search locale must be a string!');
  if (!options.region || typeof options.region! !== 'string') throw new TypeError('Search region must be a string!');
  if (!options.marketRegion || typeof options.marketRegion! !== 'string') throw new TypeError('Search market region must be a string!');
  if (options.vqd && !/\d-\d+-\d+/.test(options.vqd)) throw new Error(`${options.vqd} is an invalid VQD!`);

  return options;
}

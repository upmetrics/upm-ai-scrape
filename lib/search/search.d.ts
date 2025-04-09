import { NewsResult } from './news';
import { VideoResult } from './videos';
import { NeedleOptions } from 'needle';
import { DuckbarImageResult } from '../types';
import { SafeSearchType, SearchTimeType } from '../util';
export declare const COMMON_HEADERS: {
    'User-Agent': string;
    Referer: string;
    'Accept-Language': string;
    Accept: string;
    DNT: string;
    Connection: string;
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
export declare function search(query: string, options?: SearchOptions, needleOptions?: NeedleOptions): Promise<SearchResults>;

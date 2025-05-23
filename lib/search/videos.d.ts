import { NeedleOptions } from 'needle';
import { SafeSearchType, SearchTimeType } from '../util';
/** The types of video definition. */
export declare enum VideoDefinition {
    /** Any definition. */
    ANY = "",
    /** High definition. */
    HIGH = "high",
    /** Standard definition. */
    STANDARD = "standard"
}
/** The types of video duration. */
export declare enum VideoDuration {
    /** Any video duration. */
    ANY = "",
    /** Short videos, shorter than ~5 minutes. */
    SHORT = "short",
    /** Medium length videos, between 5 and 20 minutes. */
    MEDIUM = "medium",
    /** Long videos, longer than 20 minutes. */
    LONG = "long"
}
/** The types of video licenses. */
export declare enum VideoLicense {
    /** Any video license. */
    ANY = "",
    /** Creative Commons license. */
    CREATIVE_COMMONS = "creativeCommon",
    /** YouTube Standard license. */
    YOUTUBE = "youtube"
}
/** The options for {@link searchVideos}. */
export interface VideoSearchOptions {
    /** The safe search type of the search. */
    safeSearch?: SafeSearchType;
    /** The locale(?) of the search. Defaults to "en-us". */
    locale?: string;
    /** The number to offset the results to. */
    offset?: number;
    /**
     * The string that acts like a key to a search.
     * Set this if you made a search with the same query.
     */
    vqd?: string;
    /** The time range of the videos. */
    time?: SearchTimeType;
    definition?: VideoDefinition;
    duration?: VideoDuration;
    license?: VideoLicense;
}
/** The video results from {@link searchVideos}. */
export interface VideoSearchResults {
    /** Whether there were no results found. */
    noResults: boolean;
    /** The VQD of the search query. */
    vqd: string;
    /** The video results of the search. */
    results: VideoResult[];
}
/** A video search result. */
export interface VideoResult {
    /** The URL of the video. */
    url: string;
    /** The title of the video. */
    title: string;
    /** The description of the video. */
    description: string;
    /** The image URL of the video. */
    image: string;
    /** The duration of the video. (i.e. "9:20") */
    duration: string;
    /** The ISO timestamp of when the video was published. */
    published: string;
    /** Where the video was publised on. (i.e. "YouTube") */
    publishedOn: string;
    /** The name of who uploaded the video. */
    publisher: string;
    /** The view count of the video. */
    viewCount?: number;
}
/**
 * Search videos.
 * @category Search
 * @param query The query to search with
 * @param options The options of the search
 * @param needleOptions The options of the HTTP request
 * @returns Search results
 */
export declare function searchVideos(query: string, options?: VideoSearchOptions, needleOptions?: NeedleOptions): Promise<VideoSearchResults>;

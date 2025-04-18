"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchVideos = exports.VideoLicense = exports.VideoDuration = exports.VideoDefinition = void 0;
const html_entities_1 = require("html-entities");
const needle_1 = __importDefault(require("needle"));
const util_1 = require("../util");
/** The types of video definition. */
var VideoDefinition;
(function (VideoDefinition) {
    /** Any definition. */
    VideoDefinition["ANY"] = "";
    /** High definition. */
    VideoDefinition["HIGH"] = "high";
    /** Standard definition. */
    VideoDefinition["STANDARD"] = "standard";
})(VideoDefinition || (exports.VideoDefinition = VideoDefinition = {}));
/** The types of video duration. */
var VideoDuration;
(function (VideoDuration) {
    /** Any video duration. */
    VideoDuration["ANY"] = "";
    /** Short videos, shorter than ~5 minutes. */
    VideoDuration["SHORT"] = "short";
    /** Medium length videos, between 5 and 20 minutes. */
    VideoDuration["MEDIUM"] = "medium";
    /** Long videos, longer than 20 minutes. */
    VideoDuration["LONG"] = "long";
})(VideoDuration || (exports.VideoDuration = VideoDuration = {}));
/** The types of video licenses. */
var VideoLicense;
(function (VideoLicense) {
    /** Any video license. */
    VideoLicense["ANY"] = "";
    /** Creative Commons license. */
    VideoLicense["CREATIVE_COMMONS"] = "creativeCommon";
    /** YouTube Standard license. */
    VideoLicense["YOUTUBE"] = "youtube";
})(VideoLicense || (exports.VideoLicense = VideoLicense = {}));
const defaultOptions = {
    safeSearch: util_1.SafeSearchType.OFF,
    locale: 'en-us',
    offset: 0
};
/**
 * Search videos.
 * @category Search
 * @param query The query to search with
 * @param options The options of the search
 * @param needleOptions The options of the HTTP request
 * @returns Search results
 */
async function searchVideos(query, options, needleOptions) {
    if (!query)
        throw new Error('Query cannot be empty!');
    if (!options)
        options = defaultOptions;
    else
        options = sanityCheck(options);
    let vqd = options.vqd;
    if (!vqd)
        vqd = await (0, util_1.getVQD)(query, 'web', needleOptions);
    const filters = [
        options.time && options.time !== 'a' ? `publishedAfter:${options.time}` : '',
        options.definition ? `videoDefinition:${options.definition}` : '',
        options.duration ? `videoDuration:${options.duration}` : '',
        options.license ? `videoLicense:${options.license}` : ''
    ];
    const queryObject = {
        l: options.locale,
        o: 'json',
        q: query,
        vqd,
        p: options.safeSearch === 0 ? '1' : String(options.safeSearch),
        f: filters.toString(),
        s: String(options.offset || 0)
    };
    const response = await (0, needle_1.default)('get', `https://duckduckgo.com/v.js?${(0, util_1.queryString)(queryObject)}`, needleOptions || { headers: util_1.COMMON_HEADERS });
    if (response.statusCode === 403)
        throw new Error('A server error occurred!');
    const videosResult = (0, util_1.ensureJSON)(response.body);
    return {
        noResults: !videosResult.results.length,
        vqd,
        results: videosResult.results.map((video) => ({
            url: video.content,
            title: (0, html_entities_1.decode)(video.title),
            description: (0, html_entities_1.decode)(video.description),
            image: video.images.large || video.images.medium || video.images.small || video.images.motion,
            duration: video.duration,
            publishedOn: video.publisher,
            published: video.published,
            publisher: video.uploader,
            viewCount: video.statistics.viewCount || undefined
        }))
    };
}
exports.searchVideos = searchVideos;
function sanityCheck(options) {
    options = Object.assign({}, defaultOptions, options);
    if (!(options.safeSearch in util_1.SafeSearchType))
        throw new TypeError(`${options.safeSearch} is an invalid safe search type!`);
    if (typeof options.safeSearch === 'string')
        // @ts-ignore
        options.safeSearch = util_1.SafeSearchType[options.safeSearch];
    if (typeof options.offset !== 'number')
        throw new TypeError(`Search offset is not a number!`);
    if (options.offset < 0)
        throw new RangeError('Search offset cannot be below zero!');
    if (!options.locale || typeof options.locale !== 'string')
        throw new TypeError('Search locale must be a string!');
    if (options.time && !Object.values(util_1.SearchTimeType).includes(options.time))
        throw new TypeError(`${options.time} is an invalid time filter!`);
    if (options.definition && !Object.values(VideoDefinition).includes(options.definition))
        throw new TypeError(`${options.definition} is an invalid video definition!`);
    if (options.duration && !Object.values(VideoDuration).includes(options.duration))
        throw new TypeError(`${options.duration} is an invalid video duration!`);
    if (options.license && !Object.values(VideoLicense).includes(options.license))
        throw new TypeError(`${options.license} is an invalid video license!`);
    if (options.vqd && !/\d-\d+-\d+/.test(options.vqd))
        throw new Error(`${options.vqd} is an invalid VQD!`);
    return options;
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchNews = void 0;
const html_entities_1 = require("html-entities");
const needle_1 = __importDefault(require("needle"));
const util_1 = require("../util");
const defaultOptions = {
    safeSearch: util_1.SafeSearchType.OFF,
    locale: 'en-us',
    offset: 0
};
/**
 * Search news articles.
 * @category Search
 * @param query The query to search with
 * @param options The options of the search
 * @param needleOptions The options of the HTTP request
 * @returns Search results
 */
async function searchNews(query, options, needleOptions) {
    if (!query)
        throw new Error('Query cannot be empty!');
    if (!options)
        options = defaultOptions;
    else
        options = sanityCheck(options);
    let vqd = options.vqd;
    if (!vqd)
        vqd = await (0, util_1.getVQD)(query, 'web', needleOptions);
    const queryObject = {
        l: options.locale,
        o: 'json',
        noamp: '1',
        q: query,
        vqd,
        p: options.safeSearch === 0 ? '1' : String(options.safeSearch),
        df: options.time || '',
        s: String(options.offset || 0)
    };
    const response = await (0, needle_1.default)('get', `https://duckduckgo.com/news.js?${(0, util_1.queryString)(queryObject)}`, needleOptions || { headers: util_1.COMMON_HEADERS });
    if (response.statusCode === 403)
        throw new Error('A server error occurred!');
    const newsResult = (0, util_1.ensureJSON)(response.body);
    return {
        noResults: !newsResult.results.length,
        vqd,
        results: newsResult.results.map((article) => ({
            date: article.date,
            excerpt: (0, html_entities_1.decode)(article.excerpt),
            image: article.image,
            relativeTime: article.relative_time,
            syndicate: article.syndicate,
            title: (0, html_entities_1.decode)(article.title),
            url: article.url,
            isOld: !!article.is_old
        }))
    };
}
exports.searchNews = searchNews;
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
    if (options.vqd && !/\d-\d+-\d+/.test(options.vqd))
        throw new Error(`${options.vqd} is an invalid VQD!`);
    return options;
}

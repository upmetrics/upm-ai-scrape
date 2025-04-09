"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSpiceBody = exports.ensureJSON = exports.getVQD = exports.queryString = exports.SearchTimeType = exports.SafeSearchType = exports.COMMON_HEADERS = exports.VQD_REGEX = exports.SPICE_BASE = void 0;
const needle_1 = __importDefault(require("needle"));
/** @internal */
exports.SPICE_BASE = 'https://duckduckgo.com/js/spice';
/** @internal */
exports.VQD_REGEX = /vqd=['"](\d+-\d+(?:-\d+)?)['"]/;
/** @internal */
exports.COMMON_HEADERS = {
    'sec-ch-ua': '"Not=A?Brand";v="8", "Chromium";v="129"',
    'sec-ch-ua-mobile': '?0',
    'Referer': 'https://duckduckgo.com/',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'none',
    'Accept': 'text/html',
    'DNT': '1',
    'sec-fetch-user': '?1',
    'Connection': 'keep-alive',
    'sec-gpc': '1',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
};
/** The safe search values when searching DuckDuckGo. */
var SafeSearchType;
(function (SafeSearchType) {
    /** Strict filtering, no NSFW content. */
    SafeSearchType[SafeSearchType["STRICT"] = 0] = "STRICT";
    /** Moderate filtering. */
    SafeSearchType[SafeSearchType["MODERATE"] = -1] = "MODERATE";
    /** No filtering. */
    SafeSearchType[SafeSearchType["OFF"] = -2] = "OFF";
})(SafeSearchType || (exports.SafeSearchType = SafeSearchType = {}));
/** The type of time ranges of the search results in DuckDuckGo. */
var SearchTimeType;
(function (SearchTimeType) {
    /** From any time. */
    SearchTimeType["ALL"] = "a";
    /** From the past day. */
    SearchTimeType["DAY"] = "d";
    /** From the past week. */
    SearchTimeType["WEEK"] = "w";
    /** From the past month. */
    SearchTimeType["MONTH"] = "m";
    /** From the past year. */
    SearchTimeType["YEAR"] = "y";
})(SearchTimeType || (exports.SearchTimeType = SearchTimeType = {}));
function queryString(query) {
    return new URLSearchParams(query).toString();
}
exports.queryString = queryString;
/**
 * Get the VQD of a search query.
 * @param query The query to search
 * @param ia The type(?) of search
 * @param options The options of the HTTP request
 * @returns The VQD
 */
async function getVQD(query, ia = 'web', options) {
    try {
        const response = await (0, needle_1.default)('get', `https://duckduckgo.com/?${queryString({ q: query, ia })}`, options);
        return exports.VQD_REGEX.exec(response.body)[1];
    }
    catch (e) {
        throw new Error(`Failed to get the VQD for query "${query}".`);
    }
}
exports.getVQD = getVQD;
function ensureJSON(body) {
    if (body instanceof Buffer)
        return JSON.parse(body.toString());
    else if (typeof body === 'string')
        return JSON.parse(body);
    return body;
}
exports.ensureJSON = ensureJSON;
function parseSpiceBody(body, regex = /^ddg_spice_[\w]+\(\n?((?:.|\n)+)\n?\);?/) {
    return JSON.parse(regex.exec(body.toString())[1]);
}
exports.parseSpiceBody = parseSpiceBody;

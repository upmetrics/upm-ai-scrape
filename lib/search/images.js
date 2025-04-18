"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchImages = exports.ImageLicense = exports.ImageColor = exports.ImageLayout = exports.ImageType = exports.ImageSize = void 0;
const html_entities_1 = require("html-entities");
const needle_1 = __importDefault(require("needle"));
const util_1 = require("../util");
/** The types of image sizes. */
var ImageSize;
(function (ImageSize) {
    /** Any size. */
    ImageSize["ALL"] = "";
    /** Small size, less than 200x200. */
    ImageSize["SMALL"] = "Small";
    /** Medium size, approx. between 200x200 and 500x500. */
    ImageSize["MEDIUM"] = "Medium";
    /** Large size, approx. between 500x500 and 2000x2000. */
    ImageSize["LARGE"] = "Large";
    /** Wallpaper size, larger than 1200x1200. */
    ImageSize["WALLPAPER"] = "Wallpaper";
})(ImageSize || (exports.ImageSize = ImageSize = {}));
/** The types of images. */
var ImageType;
(function (ImageType) {
    /** Any images. */
    ImageType["ALL"] = "";
    /** Any regular photos. */
    ImageType["PHOTOGRAPH"] = "photo";
    /** Clipart. */
    ImageType["CLIPART"] = "clipart";
    /** Animated GIFs. */
    ImageType["GIF"] = "gif";
    /** Transparent photos. */
    ImageType["TRANSPARENT"] = "transparent";
    /** Line drawings. */
    ImageType["LINE_DRAWING"] = "line";
})(ImageType || (exports.ImageType = ImageType = {}));
/** The types of image layouts. */
var ImageLayout;
(function (ImageLayout) {
    /** Any size of images. */
    ImageLayout["ALL"] = "";
    /** Square images. Images may not be exactly square. */
    ImageLayout["SQUARE"] = "Square";
    /** Tall images. More height than width. */
    ImageLayout["TALL"] = "Tall";
    /** Wide images. More width than height. */
    ImageLayout["WIDE"] = "Wide";
})(ImageLayout || (exports.ImageLayout = ImageLayout = {}));
/** The types of image colors. */
var ImageColor;
(function (ImageColor) {
    /** Any image. */
    ImageColor["ALL"] = "";
    /** Any image with color. */
    ImageColor["COLOR"] = "color";
    /** Any monochome images. */
    ImageColor["BLACK_AND_WHITE"] = "Monochrome";
    /** Mostly red images. */
    ImageColor["RED"] = "Red";
    /** Mostly orange images. */
    ImageColor["ORANGE"] = "Orange";
    /** Mostly yellow images. */
    ImageColor["YELLOW"] = "Yellow";
    /** Mostly green images. */
    ImageColor["GREEN"] = "Green";
    /** Mostly blue images. */
    ImageColor["BLUE"] = "Blue";
    /** Mostly pink images. */
    ImageColor["PINK"] = "Pink";
    /** Mostly brown images. */
    ImageColor["BROWN"] = "Brown";
    /** Mostly black images. */
    ImageColor["BLACK"] = "Black";
    /** Mostly gray images. */
    ImageColor["GRAY"] = "Gray";
    /** Alias for `GRAY`. */
    ImageColor["GREY"] = "Gray";
    /** Mostly teal images. */
    ImageColor["TEAL"] = "Teal";
    /** Mostly white images. */
    ImageColor["WHITE"] = "White";
})(ImageColor || (exports.ImageColor = ImageColor = {}));
/** The types of image licenses. */
var ImageLicense;
(function (ImageLicense) {
    /** Any image license. */
    ImageLicense["ALL"] = "";
    /** All Creative Commons. */
    ImageLicense["CREATIVE_COMMONS"] = "Any";
    /** Public Domain images. */
    ImageLicense["PUBLIC_DOMAIN"] = "Public";
    /** Free to share and use. */
    ImageLicense["SHARE"] = "Share";
    /** Free to share and use commercially. */
    ImageLicense["SHARE_COMMERCIALLY"] = "ShareCommercially";
    /** Free to modify, share, and use. */
    ImageLicense["MODIFY"] = "Modify";
    /** Free to modify, share, and use commercially. */
    ImageLicense["MODIFY_COMMERCIALLY"] = "ModifyCommercially";
})(ImageLicense || (exports.ImageLicense = ImageLicense = {}));
const defaultOptions = {
    safeSearch: util_1.SafeSearchType.OFF,
    locale: 'en-us',
    offset: 0
};
/**
 * Search images.
 * @category Search
 * @param query The query to search with
 * @param options The options of the search
 * @param needleOptions The options of the HTTP request
 * @returns Search results
 */
async function searchImages(query, options, needleOptions) {
    if (!query)
        throw new Error('Query cannot be empty!');
    if (!options)
        options = defaultOptions;
    else
        options = sanityCheck(options);
    let vqd = options.vqd;
    if (!vqd)
        vqd = await (0, util_1.getVQD)(query, 'web', needleOptions);
    /* istanbul ignore next */
    const filters = [
        options.size ? `size:${options.size}` : '',
        options.type ? `type:${options.type}` : '',
        options.layout ? `layout:${options.layout}` : '',
        options.color ? `color:${options.color}` : '',
        options.license ? `license:${options.license}` : ''
    ];
    const queryObject = {
        l: options.locale,
        o: 'json',
        q: query,
        vqd,
        p: options.safeSearch === 0 ? '1' : '-1',
        f: filters.toString(),
        s: String(options.offset || 0)
    };
    const response = await (0, needle_1.default)('get', `https://duckduckgo.com/i.js?${(0, util_1.queryString)(queryObject)}`, needleOptions || { headers: util_1.COMMON_HEADERS });
    if (response.statusCode === 403)
        throw new Error('A server error occurred!');
    const imagesResult = (0, util_1.ensureJSON)(response.body);
    return {
        noResults: !imagesResult.results.length,
        vqd,
        results: imagesResult.results.map((image) => ({
            ...image,
            title: (0, html_entities_1.decode)(image.title)
        }))
    };
}
exports.searchImages = searchImages;
function sanityCheck(options) {
    options = Object.assign({}, defaultOptions, options);
    if (!(options.safeSearch in util_1.SafeSearchType))
        throw new TypeError(`${options.safeSearch} is an invalid safe search type!`);
    /* istanbul ignore next */
    if (typeof options.safeSearch === 'string')
        options.safeSearch = util_1.SafeSearchType[options.safeSearch];
    if (typeof options.offset !== 'number')
        throw new TypeError(`Search offset is not a number!`);
    if (options.offset < 0)
        throw new RangeError('Search offset cannot be below zero!');
    if (!options.locale || typeof options.locale !== 'string')
        throw new TypeError('Search locale must be a string!');
    if (options.size && !Object.values(ImageSize).includes(options.size))
        throw new TypeError(`${options.size} is an invalid image size filter!`);
    if (options.type && !Object.values(ImageType).includes(options.type))
        throw new TypeError(`${options.type} is an invalid image type filter!`);
    if (options.layout && !Object.values(ImageLayout).includes(options.layout))
        throw new TypeError(`${options.layout} is an invalid image layout filter!`);
    if (options.color && !Object.values(ImageColor).includes(options.color))
        throw new TypeError(`${options.color} is an invalid color filter!`);
    if (options.license && !Object.values(ImageLicense).includes(options.license))
        throw new TypeError(`${options.license} is an invalid license filter!`);
    if (options.vqd && !/\d-\d+-\d+/.test(options.vqd))
        throw new Error(`${options.vqd} is an invalid VQD!`);
    return options;
}

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchTimeType = exports.SafeSearchType = exports.getVQD = void 0;
__exportStar(require("./search/images"), exports);
__exportStar(require("./search/news"), exports);
__exportStar(require("./search/search"), exports);
__exportStar(require("./search/videos"), exports);
__exportStar(require("./spices/currency"), exports);
__exportStar(require("./spices/dictionary/audio"), exports);
__exportStar(require("./spices/dictionary/definition"), exports);
__exportStar(require("./spices/dictionary/hyphenation"), exports);
__exportStar(require("./spices/dictionary/pronunciation"), exports);
__exportStar(require("./spices/dns"), exports);
__exportStar(require("./spices/emojipedia"), exports);
__exportStar(require("./spices/expandUrl"), exports);
__exportStar(require("./spices/forecast"), exports);
__exportStar(require("./spices/statista"), exports);
__exportStar(require("./spices/stocks"), exports);
__exportStar(require("./spices/thesaurus"), exports);
__exportStar(require("./spices/time"), exports);
var util_1 = require("./util");
Object.defineProperty(exports, "getVQD", { enumerable: true, get: function () { return util_1.getVQD; } });
Object.defineProperty(exports, "SafeSearchType", { enumerable: true, get: function () { return util_1.SafeSearchType; } });
Object.defineProperty(exports, "SearchTimeType", { enumerable: true, get: function () { return util_1.SearchTimeType; } });

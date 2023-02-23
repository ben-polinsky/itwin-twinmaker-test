"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbValueFormat = exports.RequestKind = exports.QueryRowFormat = exports.ArgumentBindType = void 0;
var ArgumentBindType;
(function (ArgumentBindType) {
    ArgumentBindType[ArgumentBindType["Boolean"] = 0] = "Boolean";
    ArgumentBindType[ArgumentBindType["Double"] = 1] = "Double";
    ArgumentBindType[ArgumentBindType["Id"] = 2] = "Id";
    ArgumentBindType[ArgumentBindType["_3"] = 3] = "_3";
    ArgumentBindType[ArgumentBindType["Int"] = 4] = "Int";
    ArgumentBindType[ArgumentBindType["_4"] = 5] = "_4";
    ArgumentBindType[ArgumentBindType["_5"] = 6] = "_5";
    ArgumentBindType[ArgumentBindType["_6"] = 7] = "_6";
    ArgumentBindType[ArgumentBindType["_7"] = 8] = "_7";
    ArgumentBindType[ArgumentBindType["_8"] = 9] = "_8";
    ArgumentBindType[ArgumentBindType["String"] = 10] = "String";
})(ArgumentBindType = exports.ArgumentBindType || (exports.ArgumentBindType = {}));
// bool == 0
// double == 1
// int === 4
// id == 2
// string === : 9,
var QueryRowFormat;
(function (QueryRowFormat) {
    /** Each row is an object in which each non-null column value can be accessed by its name as defined in the ECSql.
     * Null values are omitted.
     */
    QueryRowFormat[QueryRowFormat["UseECSqlPropertyNames"] = 0] = "UseECSqlPropertyNames";
    /** Each row is an array of values accessed by an index corresponding to the property's position in the ECSql SELECT statement.
     * Null values are included if they are followed by a non-null column, but trailing null values at the end of the array are omitted.
     */
    QueryRowFormat[QueryRowFormat["UseECSqlPropertyIndexes"] = 1] = "UseECSqlPropertyIndexes";
    /** Each row is an object in which each non-null column value can be accessed by a [remapped property name]($docs/learning/ECSqlRowFormat.md).
     * This format is backwards-compatible with the format produced by iTwin.js 2.x. Null values are omitted.
     */
    QueryRowFormat[QueryRowFormat["UseJsPropertyNames"] = 2] = "UseJsPropertyNames";
})(QueryRowFormat = exports.QueryRowFormat || (exports.QueryRowFormat = {}));
var RequestKind;
(function (RequestKind) {
    RequestKind[RequestKind["BlobIO"] = 0] = "BlobIO";
    RequestKind[RequestKind["ECSql"] = 1] = "ECSql";
})(RequestKind = exports.RequestKind || (exports.RequestKind = {}));
var DbValueFormat;
(function (DbValueFormat) {
    DbValueFormat[DbValueFormat["ECSqlNames"] = 0] = "ECSqlNames";
    DbValueFormat[DbValueFormat["JsNames"] = 1] = "JsNames";
})(DbValueFormat = exports.DbValueFormat || (exports.DbValueFormat = {}));

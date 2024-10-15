"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
var util_1 = require("util");
var Logger = /** @class */ (function () {
    function Logger() {
    }
    /**
     * @private
     */
    Logger.prototype.prefix = function (loggerLevel) {
        return (0, util_1.format)('[%s] [%s]', new Date().toLocaleString(), loggerLevel);
    };
    Logger.prototype.fatal = function (msg) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        console.error(util_1.format.apply(void 0, __spreadArray(["".concat(this.prefix('fatal'), " ").concat(msg)], args, false)));
    };
    Logger.prototype.error = function (msg) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        console.error(util_1.format.apply(void 0, __spreadArray(["".concat(this.prefix('error'), " ").concat(msg)], args, false)));
    };
    Logger.prototype.warn = function (msg) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        console.warn(util_1.format.apply(void 0, __spreadArray(["".concat(this.prefix('warn'), " ").concat(msg)], args, false)));
    };
    Logger.prototype.info = function (msg) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        console.log(util_1.format.apply(void 0, __spreadArray(["".concat(this.prefix('info'), " ").concat(msg)], args, false)));
    };
    Logger.prototype.debug = function (msg) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        console.log(util_1.format.apply(void 0, __spreadArray(["".concat(this.prefix('debug'), " ").concat(msg)], args, false)));
    };
    return Logger;
}());
exports["default"] = new Logger();

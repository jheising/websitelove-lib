"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nanoid_1 = require("nanoid");
class Utils {
    static isServer() {
        return !Utils.isClient();
    }
    static isClient() {
        return (typeof window !== 'undefined');
    }
    static generateID(length) {
        return nanoid_1.nanoid(length);
    }
}
exports.Utils = Utils;
//# sourceMappingURL=Utils.js.map
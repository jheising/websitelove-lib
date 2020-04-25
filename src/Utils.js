"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Utils {
    static isServer() {
        return !Utils.isClient();
    }
    static isClient() {
        return (typeof window !== 'undefined');
    }
}
exports.Utils = Utils;
//# sourceMappingURL=Utils.js.map
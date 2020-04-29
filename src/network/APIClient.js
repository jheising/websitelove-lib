"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const each_1 = __importDefault(require("lodash/each"));
const isNil_1 = __importDefault(require("lodash/isNil"));
const isObjectLike_1 = __importDefault(require("lodash/isObjectLike"));
const defaults_1 = __importDefault(require("lodash/defaults"));
const Utils_1 = require("../Utils");
let _fetch = Utils_1.Utils.isServer() ? require("node-fetch-polyfill") : window.fetch;
class APIClient {
    static createFullURLWithQueryParams(urlString, queryParams) {
        let url = new URL(urlString);
        each_1.default(queryParams, (paramValue, paramName) => {
            if (isNil_1.default(paramValue)) {
                return;
            }
            if (isObjectLike_1.default(paramValue)) {
                paramValue = JSON.stringify(paramValue);
            }
            else {
                paramValue = paramValue.toString();
            }
            url.searchParams.append(paramName, paramValue);
        });
        return url.href;
    }
    static async makeAPICall(method, endpoint, requestOptions) {
        requestOptions = defaults_1.default({}, requestOptions, {
            timeoutInMS: 10000,
            headers: {},
            credentials: "include",
            cache: "no-store"
        });
        if (requestOptions.method !== "GET" && isObjectLike_1.default(requestOptions.body)) {
            requestOptions.headers["Content-Type"] = "application/json";
            requestOptions.body = JSON.stringify(requestOptions.body);
        }
        let timedOut = false;
        let timeout = setTimeout(() => {
            timedOut = true;
            throw new Error("Request timed out");
        }, requestOptions.timeoutInMS);
        let response;
        let fullURL = APIClient.createFullURLWithQueryParams(APIClient.API_BASE_URL + endpoint, requestOptions.queryParams);
        try {
            response = await _fetch(fullURL, requestOptions);
        }
        catch (e) {
            if (timedOut)
                return;
            clearTimeout(timeout);
            throw e;
        }
        if (timedOut)
            return;
        clearTimeout(timeout);
        let responseData = await response.json();
        if (responseData.this === "failed") {
            throw responseData;
        }
        if (responseData.this === "succeeded") {
            return responseData.with;
        }
        return responseData;
    }
}
exports.APIClient = APIClient;
APIClient.API_BASE_URL = "http://localhost:3001";
//# sourceMappingURL=APIClient.js.map
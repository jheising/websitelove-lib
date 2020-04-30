import each from "lodash/each";
import isNil from "lodash/isNil";
import isObjectLike from "lodash/isObjectLike";
import defaults from "lodash/defaults";
import {Utils} from "../Utils";
import {SiteConfig} from "../SiteConfig";

let _fetch = Utils.isServer() ? require("node-fetch-polyfill") : (window as any).fetch;

export interface APIClientRequestOptions extends RequestInit {
    apiBaseURL?: string;
    queryParams?: object;
    body?: any;
    headers?: any;
    timeoutInMS?: number;
}

export class APIClient {

    static createFullURLWithQueryParams(urlString: string, queryParams: { [paramName: string]: any }): string {
        let url = new URL(urlString);

        each(queryParams, (paramValue, paramName) => {

            if (isNil(paramValue)) {
                return;
            }

            if (isObjectLike(paramValue)) {
                paramValue = JSON.stringify(paramValue);
            } else {
                paramValue = paramValue.toString();
            }

            url.searchParams.append(paramName, paramValue);
        });

        return url.href;
    }

    static async makeAPICall(method: string, endpoint: string, requestOptions?: APIClientRequestOptions): Promise<any> {

        requestOptions = defaults({}, requestOptions, {
            timeoutInMS: 10000,
            headers: {},
            credentials: "include",
            cache: "no-store",
            apiBaseURL: SiteConfig.apiBaseURL
        });

        if (requestOptions.method !== "GET" && isObjectLike(requestOptions.body)) {
            requestOptions.headers["Content-Type"] = "application/json";
            requestOptions.body = JSON.stringify(requestOptions.body);
        }

        let timedOut = false;
        let timeout = setTimeout(() => {
            timedOut = true;
            throw new Error("Request timed out");
        }, requestOptions.timeoutInMS);

        let response;
        let fullURL = APIClient.createFullURLWithQueryParams(requestOptions.apiBaseURL + endpoint, requestOptions.queryParams);

        try {
            response = await _fetch(fullURL, requestOptions);
        } catch (e) {

            if (timedOut) {
                return;
            }

            clearTimeout(timeout);
            throw e;
        }

        if (timedOut) {
            return;
        }

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
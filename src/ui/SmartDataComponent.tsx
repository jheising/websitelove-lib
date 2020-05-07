import React from "react";
import {SmartComponent, SmartComponentState} from "./SmartComponent";
import {APIClient, APIClientRequestOptions} from "../network/APIClient";

export interface SmartDataComponentState extends SmartComponentState {
    isLoading?: boolean;
}

export abstract class SmartDataComponent<P = {}, S extends SmartDataComponentState = {}> extends SmartComponent<P, S> {

    async makeAPICall(method: string, endpoint: string, requestOptions?: APIClientRequestOptions, setState:boolean = true)
    {
        if(setState)
        {
            this.setState({
                isLoading: true
            });
        }

        const results = await APIClient.makeAPICall(method, endpoint, requestOptions);

        if(setState)
        {
            this.setState({
                isLoading: false
            });
        }

        return results;
    }

    async fetchStateDataFromAPI(fetchInfo: { [stateKeyName in keyof P]: [string, string, APIClientRequestOptions] }, extraState?: Partial<S>, setState: boolean = true): Promise<Partial<S>> {
        const stateKeys = Object.keys(fetchInfo);

        if (setState) {
            this.setState({
                isLoading: true
            });
        }

        let results: any[];

        try {
            results = await Promise.all(stateKeys.map(stateKey => {
                const info = fetchInfo[stateKey];
                return APIClient.makeAPICall(info[0], info[1], info[2])
            }));
        } catch (e) {

            if (this.setState) {
                this.setState({
                    isLoading: false
                });

                this.throwError(undefined, e);
            } else {
                throw e;
            }

            return;
        }

        let newState: Partial<S> = {
            isLoading: false,
            ...extraState
        };

        for (let index = 0; index < stateKeys.length; index++) {
            const stateKey = stateKeys[index];
            const result = results[index];

            newState[stateKey] = result;
        }

        if (setState) {
            this.setState(newState as any);
        }

        return newState;
    }
}
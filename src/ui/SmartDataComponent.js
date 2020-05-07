"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SmartComponent_1 = require("./SmartComponent");
const APIClient_1 = require("../network/APIClient");
class SmartDataComponent extends SmartComponent_1.SmartComponent {
    async makeAPICall(method, endpoint, requestOptions, setState = true) {
        if (setState) {
            this.setState({
                isLoading: true
            });
        }
        const results = await APIClient_1.APIClient.makeAPICall(method, endpoint, requestOptions);
        if (setState) {
            this.setState({
                isLoading: false
            });
        }
        return results;
    }
    async fetchStateDataFromAPI(fetchInfo, extraState, setState = true) {
        const stateKeys = Object.keys(fetchInfo);
        if (setState) {
            this.setState({
                isLoading: true
            });
        }
        let results;
        try {
            results = await Promise.all(stateKeys.map(stateKey => {
                const info = fetchInfo[stateKey];
                return APIClient_1.APIClient.makeAPICall(info[0], info[1], info[2]);
            }));
        }
        catch (e) {
            if (this.setState) {
                this.setState({
                    isLoading: false
                });
                this.throwError(undefined, e);
            }
            else {
                throw e;
            }
            return;
        }
        let newState = Object.assign({ isLoading: false }, extraState);
        for (let index = 0; index < stateKeys.length; index++) {
            const stateKey = stateKeys[index];
            const result = results[index];
            newState[stateKey] = result;
        }
        if (setState) {
            this.setState(newState);
        }
        return newState;
    }
}
exports.SmartDataComponent = SmartDataComponent;
//# sourceMappingURL=SmartDataComponent.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const get_1 = __importDefault(require("lodash/get"));
const set_1 = __importDefault(require("lodash/set"));
const toPath_1 = __importDefault(require("lodash/toPath"));
const cloneDeep_1 = __importDefault(require("lodash/cloneDeep"));
const isArray_1 = __importDefault(require("lodash/isArray"));
const debounce_1 = __importDefault(require("lodash/debounce"));
const SiteConfig_1 = require("../SiteConfig");
function handleBindInputToStateOnChange(thisArg, statePath, newValue, onChange) {
    const newState = UIUtils.setValuesInStateProps(thisArg.state, [statePath, newValue]);
    thisArg.setState(newState, () => {
        if (onChange) {
            onChange(newValue, statePath);
        }
    });
}
class UIUtils {
    static setValuesInStateProps(currentStateProps, pathsAndValues) {
        let pathsAndValuesArray = pathsAndValues;
        if (!isArray_1.default(pathsAndValues[0])) {
            pathsAndValuesArray = [pathsAndValues];
        }
        let newState = {};
        for (const pathAndValue of pathsAndValuesArray) {
            const path = pathAndValue[0];
            const value = pathAndValue[1];
            const pathArray = toPath_1.default(path);
            const statePropertyName = pathArray[0];
            newState[statePropertyName] = cloneDeep_1.default(currentStateProps[statePropertyName]);
            set_1.default(newState, path, value);
        }
        return newState;
    }
    static bindInputToState(thisArg, statePath, onChange, debounceInMS = 0) {
        let props = {};
        if (debounceInMS > 0) {
            props.defaultValue = get_1.default(thisArg.state, statePath) || "";
            if (!thisArg._debounceFunctions) {
                thisArg._debounceFunctions = {};
            }
            const debounceFunctionKey = JSON.stringify(statePath);
            let debounceFunction = thisArg._debounceFunctions[debounceFunctionKey];
            if (!debounceFunction) {
                debounceFunction = debounce_1.default(handleBindInputToStateOnChange, debounceInMS);
                thisArg._debounceFunctions[debounceFunctionKey] = debounceFunction;
            }
            props.onChange = (event) => {
                debounceFunction(thisArg, statePath, event.target.value, onChange);
            };
        }
        else {
            props.value = get_1.default(thisArg.state, statePath) || "";
            props.onChange = (event) => {
                handleBindInputToStateOnChange(thisArg, statePath, event.target.value, onChange);
            };
        }
        return props;
    }
    static submitOnEnterKey(submitHandler) {
        return {
            onKeyDown: (event) => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    event.stopPropagation();
                    submitHandler(event);
                }
            }
        };
    }
    static requireFromCDN(relativeURL) {
        return SiteConfig_1.SiteConfig.cdnBaseURL + relativeURL;
    }
}
exports.UIUtils = UIUtils;
//# sourceMappingURL=UIUtils.js.map
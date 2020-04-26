import React from "react";
import get from "lodash/get";
import set from "lodash/set";
import toPath from "lodash/toPath";
import cloneDeep from "lodash/cloneDeep";
import isArray from "lodash/isArray";
import debounce from "lodash/debounce";

export type PathAndValue = [string | string[], any];

function handleBindInputToStateOnChange(thisArg: React.Component, statePath: string | string[], newValue: any, onChange?: (newValue, statePath: string | string[]) => void) {
    const newState = UIUtils.setValuesInStateProps(thisArg.state, [statePath, newValue]);
    thisArg.setState(newState, () => {
        if (onChange) {
            onChange(newValue, statePath);
        }
    });
}

export class UIUtils {

    static setValuesInStateProps<T = {}>(currentStateProps: T, pathsAndValues: PathAndValue | PathAndValue[]): Partial<T> {
        let pathsAndValuesArray = pathsAndValues;

        if (!isArray(pathsAndValues[0])) {
            pathsAndValuesArray = [pathsAndValues as PathAndValue];
        }

        let newState: Partial<T> = {};

        for (const pathAndValue of pathsAndValuesArray) {
            const path = pathAndValue[0];
            const value = pathAndValue[1];

            const pathArray = toPath(path);
            const statePropertyName = pathArray[0];

            newState[statePropertyName] = cloneDeep(currentStateProps[statePropertyName]);
            set(newState, path, value);
        }

        return newState;
    }

    static bindInputToState(thisArg: React.Component, statePath: string | string[],
                            onChange?: (newValue, statePath: string | string[]) => void,
                            debounceInMS: number = 0) {
        let props: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> = {};

        if (debounceInMS > 0) {
            props.defaultValue = get(thisArg.state, statePath) || "";

            if (!(thisArg as any)._debounceFunctions) {
                (thisArg as any)._debounceFunctions = {};
            }

            const debounceFunctionKey = JSON.stringify(statePath);
            let debounceFunction = (thisArg as any)._debounceFunctions[debounceFunctionKey];

            if (!debounceFunction) {
                debounceFunction = debounce(handleBindInputToStateOnChange, debounceInMS);
                (thisArg as any)._debounceFunctions[debounceFunctionKey] = debounceFunction;
            }

            props.onChange = (event) => {
                debounceFunction(thisArg, statePath, event.target.value, onChange);
            };

        } else {
            props.value = get(thisArg.state, statePath) || "";
            props.onChange = (event) => {
                handleBindInputToStateOnChange(thisArg, statePath, event.target.value, onChange);
            };
        }

        return props;
    }

    static submitOnEnterKey(submitHandler: (event) => void): Partial<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>> {
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
}
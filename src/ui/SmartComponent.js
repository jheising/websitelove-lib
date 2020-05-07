"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
const SiteRenderer_1 = require("../SiteRenderer");
class SmartComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.passAndBubbleErrors = false;
        this.state = {};
    }
    static getDerivedStateFromError(error) {
        return {
            currentErrorMessage: "An error occurred",
            currentError: error
        };
    }
    redirectTo(url) {
        this.setState({
            redirectTo: url
        }, () => {
            this.setState({
                redirectTo: null
            });
        });
    }
    throwError(message, error) {
        this.setState({
            currentErrorMessage: message,
            currentError: error
        });
        console.error(error);
    }
    renderError() {
        if (this.passAndBubbleErrors) {
            throw this.state.currentError ? this.state.currentError : new Error(this.state.currentErrorMessage);
        }
        return this.state.currentErrorMessage || "Sorry, an error occurred";
    }
    render() {
        if (this.state.redirectTo) {
            return react_1.default.createElement(react_router_dom_1.Redirect, { push: true, to: this.state.redirectTo });
        }
        if (this.state.currentError || this.state.currentErrorMessage) {
            return this.renderError();
        }
        return this.renderContent();
    }
}
exports.SmartComponent = SmartComponent;
SmartComponent.contextType = SiteRenderer_1.SiteRenderer.USER_CONTEXT;
//# sourceMappingURL=SmartComponent.js.map
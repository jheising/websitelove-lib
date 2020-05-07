"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
class _RoutableView extends react_1.default.PureComponent {
    render() {
        return react_1.default.createElement(react_router_dom_1.Switch, null, this.props.views.map((viewProps, index) => {
            let path = viewProps.path || "";
            if (!(/^[./]/.test(path))) {
                path = `${this.props.match.url}${path}`;
            }
            return react_1.default.createElement(react_router_dom_1.Route, { key: path + index, exact: viewProps.exact, path: path }, viewProps.renderer ? viewProps.renderer(this.props.match.params) : null);
        }));
    }
}
const RoutableView = react_router_dom_1.withRouter(_RoutableView);
exports.RoutableView = RoutableView;
//# sourceMappingURL=RoutableView.js.map
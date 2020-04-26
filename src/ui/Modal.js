"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_dom_1 = __importDefault(require("react-dom"));
class Modal extends react_1.default.PureComponent {
    constructor() {
        super(...arguments);
        this.handleBackgroundClick = () => {
            if (this.props.closeOnBackgroundClick) {
                Modal.hide();
            }
        };
        this.handleModalClick = (event) => {
            event.stopPropagation();
        };
    }
    static show(content, props) {
        Modal.hide();
        if (!Modal._modalElement) {
            Modal._modalElement = document.createElement("div");
            Modal._currentProps = props;
            document.body.appendChild(Modal._modalElement);
        }
        react_dom_1.default.render(react_1.default.createElement(Modal, Object.assign({}, props), content), Modal._modalElement);
    }
    static hide() {
        if (Modal._modalElement) {
            react_dom_1.default.unmountComponentAtNode(Modal._modalElement);
            Modal._modalElement.parentElement.removeChild(Modal._modalElement);
            Modal._modalElement = null;
        }
        if (Modal._currentProps) {
            if (Modal._currentProps.onClosed) {
                Modal._currentProps.onClosed();
            }
            Modal._currentProps = null;
        }
    }
    render() {
        return react_1.default.createElement("div", { style: {
                position: "fixed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "auto",
                backgroundColor: this.props.backgroundColor || "transparent",
                width: "100%",
                height: "100%",
                top: 0,
                right: 0
            }, onClick: this.handleBackgroundClick },
            react_1.default.createElement("div", { onClick: this.handleModalClick }, this.props.children));
    }
}
exports.Modal = Modal;
//# sourceMappingURL=Modal.js.map
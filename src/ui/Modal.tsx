import React, {ReactNode} from "react";
import ReactDOM from "react-dom";
import {BackgroundColorProperty} from "csstype";

export interface ModalProps {
    backgroundColor?: BackgroundColorProperty;
    closeOnBackgroundClick?: boolean;

    onClosed?: () => void;
}

export class Modal extends React.PureComponent<ModalProps> {

    private static _modalElement: HTMLDivElement;
    private static _currentProps: ModalProps;

    static show(content: ReactNode, props?: ModalProps) {
        Modal.hide();

        if (!Modal._modalElement) {
            Modal._modalElement = document.createElement("div");
            Modal._currentProps = props;
            document.body.appendChild(Modal._modalElement);
        }

        ReactDOM.render(<Modal {...props}>{content}</Modal>, Modal._modalElement);
    }

    static hide() {
        if (Modal._modalElement) {
            ReactDOM.unmountComponentAtNode(Modal._modalElement);
            Modal._modalElement.parentElement.removeChild(Modal._modalElement);
            Modal._modalElement = null;
        }

        if(Modal._currentProps)
        {
            if(Modal._currentProps.onClosed)
            {
                Modal._currentProps.onClosed();
            }

            Modal._currentProps = null;
        }
    }

    handleBackgroundClick = () => {
        if (this.props.closeOnBackgroundClick) {
            Modal.hide();
        }
    };

    handleModalClick = (event) => {
        event.stopPropagation();
    };

    render() {
        return <div style={{
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
        }}
                    onClick={this.handleBackgroundClick}>
            <div onClick={this.handleModalClick}>
                {this.props.children}
            </div>
        </div>;
    }
}
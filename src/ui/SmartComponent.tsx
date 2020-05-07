import React from "react";
import {Redirect} from "react-router-dom";
import {SiteRenderer} from "../SiteRenderer";

export interface SmartComponentState {
    redirectTo?: string;

    currentErrorMessage?: string;
    currentError?: Error;
}

export abstract class SmartComponent<P = {}, S extends SmartComponentState = {}> extends React.Component<P, S> {

    static contextType = SiteRenderer.USER_CONTEXT;

    passAndBubbleErrors:boolean = false;

    constructor(props) {
        super(props);
        (this.state as any) = {};
    }

    static getDerivedStateFromError(error: Error) {
        return {
            currentErrorMessage: "An error occurred",
            currentError: error
        }
    }

    redirectTo(url: string) {
        this.setState({
            redirectTo: url
        }, () => {
            this.setState({
                redirectTo: null
            });
        });
    }

    throwError(message: string, error?: Error) {
        this.setState({
            currentErrorMessage: message,
            currentError: error
        });

        console.error(error);
    }

    abstract renderContent();

    renderError() {

        if(this.passAndBubbleErrors)
        {
            throw this.state.currentError ? this.state.currentError : new Error(this.state.currentErrorMessage);
        }

        return this.state.currentErrorMessage || "Sorry, an error occurred";
    }

    render() {
        if (this.state.redirectTo) {
            return <Redirect push to={this.state.redirectTo}/>
        }

        if (this.state.currentError || this.state.currentErrorMessage) {
            return this.renderError();
        }

        return this.renderContent();
    }
}
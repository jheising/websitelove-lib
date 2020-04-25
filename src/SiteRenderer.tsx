import ReactDOM from "react-dom";
import React from "react";
import {BrowserRouter as Router} from "react-router-dom";
import {Utils} from "./Utils";
import castArray from "lodash/castArray";

export interface UserContextProps {
    currentUserID?: string;
    currentUsername?: string;
}

export type PageLoaderCallback = (pageName: string) => Promise<React.ComponentClass>

export class SiteRenderer {

    static APPLICATION_SCRIPT_PATH = "/scripts/app.js";
    static DEFAULT_HEAD_CONTENT = [];

    static registerClientPageLoaderCallback(clientPageLoaderCallback: PageLoaderCallback) {
        if (Utils.isClient()) {
            (window as any)._pageLoaderCallback = clientPageLoaderCallback;
            (window as any)._initSite = SiteRenderer._clientSideRender;
        }
    }

    static async renderServerPage(
        pageName: string,
        serverPageLoaderCallback: PageLoaderCallback,
        pageComponentProps: object,
        req,
        res,
        userContextProps?: UserContextProps,
        headContent: string | string[] = SiteRenderer.DEFAULT_HEAD_CONTENT
    ) {

        const pageComponentType = await serverPageLoaderCallback(pageName);
        const pageContent = await SiteRenderer._serverSideRender(pageComponentType, pageComponentProps, req, res, userContextProps);

        if (!pageContent) {
            // if page content is null, then it means we are doing a redirect.
            return;
        }

        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
${castArray(headContent).join("\n")}
</head>
<body>
<div id="root">${pageContent}</div>
<script src="${SiteRenderer.APPLICATION_SCRIPT_PATH}"></script>
<script>
if(window._initSite)
{
    window._initSite(
        "${pageName}", 
        ${JSON.stringify(pageComponentProps)},
        ${JSON.stringify(userContextProps)}
    );   
}
</script>
</body>
</html>`;

        res.set('Content-Type', 'text/html');
        res.write(htmlContent);
        res.end();
    }

    private static _createPageComponent(pageComponentType: React.ComponentClass,
                                        pageComponentProps: any,
                                        userContextProps?: UserContextProps
    ) {

        let pageComponent = React.createElement(pageComponentType, pageComponentProps);

        if (!userContextProps) {
            return pageComponent;
        }

        const userContext = React.createContext(userContextProps);

        return <userContext.Provider value={userContextProps}>
            {pageComponent}
        </userContext.Provider>;
    }

    private static async _clientSideRender(pageName: string,
                                           pageComponentProps: object,
                                           userContextProps?: object) {

        const pageComponentType = await (window as any)._pageLoaderCallback(pageName);

        ReactDOM.hydrate(<Router>
            {SiteRenderer._createPageComponent(pageComponentType, pageComponentProps, userContextProps)}
        </Router>, document.getElementById("root"));
    }

    private static async _serverSideRender(pageComponentType: React.ComponentClass,
                                           pageComponentProps: object,
                                           req: any, res: any,
                                           userContextProps?: object): Promise<string> {

        const ReactDOMServer = require("react-dom/server");
        const StaticRouter = require("react-router-dom").StaticRouter;

        const routerContext: any = {};
        let siteComponent = <StaticRouter location={req.originalUrl} context={routerContext}>
            {SiteRenderer._createPageComponent(pageComponentType, pageComponentProps, userContextProps)}
        </StaticRouter>;

        // routerContext.url will contain the URL to redirect to if a <Redirect> was used
        if (routerContext.url) {
            res.redirect(routerContext.url);
            return null;
        }

        return ReactDOMServer.renderToString(siteComponent);
    }
}
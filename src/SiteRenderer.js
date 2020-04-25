"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_dom_1 = __importDefault(require("react-dom"));
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
const Utils_1 = require("./Utils");
const castArray_1 = __importDefault(require("lodash/castArray"));
class SiteRenderer {
    static registerClientPageLoaderCallback(clientPageLoaderCallback) {
        if (Utils_1.Utils.isClient()) {
            window._pageLoaderCallback = clientPageLoaderCallback;
            window._initSite = SiteRenderer._clientSideRender;
        }
    }
    static async renderServerPage(pageName, serverPageLoaderCallback, pageComponentProps, req, res, userContextProps, headContent = SiteRenderer.DEFAULT_HEAD_CONTENT) {
        const pageComponentType = await serverPageLoaderCallback(pageName);
        const pageContent = await SiteRenderer._serverSideRender(pageComponentType, pageComponentProps, req, res, userContextProps);
        if (!pageContent) {
            // if page content is null, then it means we are doing a redirect.
            return;
        }
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
${castArray_1.default(headContent).join("\n")}
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
    static _createPageComponent(pageComponentType, pageComponentProps, userContextProps) {
        let pageComponent = react_1.default.createElement(pageComponentType, pageComponentProps);
        if (!userContextProps) {
            return pageComponent;
        }
        const userContext = react_1.default.createContext(userContextProps);
        return react_1.default.createElement(userContext.Provider, { value: userContextProps }, pageComponent);
    }
    static async _clientSideRender(pageName, pageComponentProps, userContextProps) {
        const pageComponentType = await window._pageLoaderCallback(pageName);
        react_dom_1.default.hydrate(react_1.default.createElement(react_router_dom_1.BrowserRouter, null, SiteRenderer._createPageComponent(pageComponentType, pageComponentProps, userContextProps)), document.getElementById("root"));
    }
    static async _serverSideRender(pageComponentType, pageComponentProps, req, res, userContextProps) {
        const ReactDOMServer = require("react-dom/server");
        const StaticRouter = require("react-router-dom").StaticRouter;
        const routerContext = {};
        let siteComponent = react_1.default.createElement(StaticRouter, { location: req.originalUrl, context: routerContext }, SiteRenderer._createPageComponent(pageComponentType, pageComponentProps, userContextProps));
        // routerContext.url will contain the URL to redirect to if a <Redirect> was used
        if (routerContext.url) {
            res.redirect(routerContext.url);
            return null;
        }
        return ReactDOMServer.renderToString(siteComponent);
    }
}
exports.SiteRenderer = SiteRenderer;
SiteRenderer.APPLICATION_SCRIPT_PATH = "/scripts/app.js";
SiteRenderer.DEFAULT_HEAD_CONTENT = [];
//# sourceMappingURL=SiteRenderer.js.map
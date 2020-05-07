import React from "react";
import {Switch, Route, NavLink, withRouter} from "react-router-dom";

export interface RoutableViewRoute {
    path: string;

    pageName?: string;
    exact?: boolean;

    renderer?: (pathParams?: object) => React.ReactElement;
}

export interface RoutableViewProps {
    views: RoutableViewRoute[];
}

class _RoutableView extends React.PureComponent<RoutableViewProps> {

    render() {
        return <Switch>
            {this.props.views.map((viewProps, index) => {
                let path = viewProps.path || "";

                if (!(/^[./]/.test(path))) {
                    path = `${(this.props as any).match.url}${path}`;
                }

                return <Route key={path + index}
                              exact={viewProps.exact}
                              path={path}>
                    {viewProps.renderer ? viewProps.renderer((this.props as any).match.params) : null}
                </Route>;
            })}
        </Switch>
    }
}

const RoutableView:React.ComponentClass<RoutableViewProps> = withRouter(_RoutableView);
export {RoutableView};
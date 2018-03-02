import * as React from "react";

import * as css from "./infos.scss";

export interface InfosProps {
    readonly children: JSX.Element[];
}

export class Infos extends React.Component<InfosProps> {
    public render() {
        return (
            <div className={css.infos}>
                {this.props.children}
            </div>
        );
    }
}

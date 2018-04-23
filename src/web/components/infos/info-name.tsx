import * as React from "react";
import * as css from "./infos.scss";

export interface InfoNameProps {
    readonly children: JSX.Element | string | string[] | number;
}

export class InfoName extends React.Component<InfoNameProps> {
    public render() {
        return (
            <div className={css.name}>
                {this.props.children}
            </div>
        );
    }
}

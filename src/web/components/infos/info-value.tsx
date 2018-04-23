import * as React from "react";
import * as css from "./infos.scss";

export interface InfoValueProps {
    readonly children: JSX.Element | string | string[] | number;
}

export class InfoValue extends React.Component<InfoValueProps> {
    public render() {
        return (
            <div className={css.value}>
                {this.props.children}
            </div>
        );
    }
}

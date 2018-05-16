import * as React from "react";
import { SemanticCOLORS } from "semantic-ui-react";

export interface SliderProps {
    settings?: {
        start?: number;
        min?: number;
        max?: number;
        step?: number;
        onChange?: (value: number) => void;
    };
    color?: SemanticCOLORS;
    disabled?: boolean;
    inverted?: boolean;
    value?: number;
    style?: React.CSSProperties;
    className?: string;
}

export class Slider extends React.Component<SliderProps, {}> {
}

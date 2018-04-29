import { observable, computed, action } from "mobx";
import { bind } from "decko";
import { component, initialize } from "tsdi";

import { breakpointL } from "../breakpoints";

@component
export class SidebarStore {
    @observable public visibilityToggled = false;
    @observable public alwaysOpen = this.calculateAlwaysOpen();

    private calculateAlwaysOpen() {
        return window.innerWidth >= breakpointL;
    }

    @bind
    private onWindowResize() {
        this.alwaysOpen = this.calculateAlwaysOpen();
    }

    @initialize public init() {
        window.addEventListener("resize", this.onWindowResize);
    }

    @computed public get visible() {
        return this.visibilityToggled || this.alwaysOpen;
    }

    @bind @action public toggleVisibility() {
        this.visibilityToggled = ! this.visibilityToggled;
    }
}

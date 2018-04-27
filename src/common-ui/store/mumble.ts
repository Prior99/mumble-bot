import { observable, computed, action } from "mobx";
import { bind } from "decko";
import { component, initialize, inject } from "tsdi";
import { Channel, Utilities, MumbleUser, MumbleLink, MumbleLinks } from "../../common";
import { LoginStore } from "./login";

@component
export class MumbleStore {
    @inject private utilities: Utilities;
    @inject private mumbleLinks: MumbleLinks;
    @inject private login: LoginStore;

    @observable public channelTree: Channel;
    @observable public users: MumbleUser[] = [];
    @observable public links: MumbleLink[] = [];

    @initialize
    protected async initialize() {
        this.channelTree = await this.utilities.channelTree();
        this.users = await this.utilities.getMumbleUsers();
        this.links = await this.mumbleLinks.getMumbleLinks();
    }

    @computed public get linkableUsers() {
        return this.users.filter(this.isLinkable);
    }

    @computed public get linksThisUser() {
        return this.links.filter(link => link.user.id === this.login.userId);
    }

    @bind public isLinkable(mumbleUser: MumbleUser) {
        return typeof mumbleUser.id !== "undefined" && !this.links.some(link => link.mumbleId === mumbleUser.id);
    }

    @bind public isLinkedToThisUser(mumbleUser: MumbleUser) {
        return this.linksThisUser.some(link => mumbleUser.id === link.mumbleId);
    }

    @bind @action public async link(mumbleUser: MumbleUser) {
        const link = await this.mumbleLinks.createMumbleLink({
            mumbleId: mumbleUser.id,
            user: { id: this.login.userId },
        });
        this.links.push(link);
    }
}

import { observable, computed, action } from "mobx";
import { bind } from "decko";
import { component, initialize, inject } from "tsdi";
import { Channel, Utilities, MumbleUser, MumbleLink, MumbleLinks, User } from "../../common";
import { LoginStore } from "./login";
import { UsersStore } from "./";

@component
export class MumbleStore {
    @inject private utilities: Utilities;
    @inject private mumbleLinks: MumbleLinks;
    @inject private login: LoginStore;
    @inject private users: UsersStore;

    @observable public channelTree: Channel;
    @observable public mumbleUsers: Map<number, MumbleUser> = new Map();
    @observable public links: MumbleLink[] = [];

    @initialize
    protected async initialize() {
        this.channelTree = await this.utilities.channelTree();
        const users = await this.utilities.getMumbleUsers();
        users.forEach(user => this.mumbleUsers.set(user.id, user));
        this.links = await this.mumbleLinks.getMumbleLinks();
    }

    @computed public get linkableUsers() {
        return this.allUsers.filter(this.isLinkable);
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

    @bind public isMumbleUserLinked(mumbleUser: MumbleUser) {
        return this.links.some(link => mumbleUser.id === link.mumbleId);
    }

    @bind public isUserLinked(user: User) {
        return this.links.some(link => user.id === link.user.id);
    }

    @bind public getUser(mumbleUser: MumbleUser) {
        if (!this.isMumbleUserLinked(mumbleUser)) { return; }
        const userId = this.links.find(link => mumbleUser.id === link.mumbleId).user.id;
        return this.users.byId(userId);
    }

    @bind public getMumbleUser(user: User) {
        if (!this.isUserLinked(user)) { return; }
        const mumbleUserId = this.links.find(link => user.id === link.user.id).mumbleId;
        return this.mumbleUserById(mumbleUserId);
    }

    @bind public mumbleUserById(id: number) {
        return this.mumbleUsers.get(id);
    }

    @computed public get allUsers() {
        return Array.from(this.mumbleUsers.values());
    }

    @bind @action public async link(mumbleUser: MumbleUser) {
        const link = await this.mumbleLinks.createMumbleLink({
            mumbleId: mumbleUser.id,
            user: { id: this.login.userId } as User,
        });
        this.links.push(link);
    }
}

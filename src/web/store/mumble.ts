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
    @observable public links = new Map<string, MumbleLink>();

    @initialize
    protected async initialize() {
        this.channelTree = await this.utilities.channelTree();
        const users = await this.utilities.getMumbleUsers();
        users.forEach(user => this.mumbleUsers.set(user.id, user));
        (await this.mumbleLinks.getMumbleLinks()).forEach(link => {
            this.links.set(link.id, link);
        });
    }

    @computed public get allLinks() {
        return Array.from(this.links.values());
    }

    @computed public get linkableUsers() {
        return this.allUsers.filter(this.isLinkable);
    }

    @computed public get linksThisUser() {
        return this.allLinks.filter(link => link.user.id === this.login.userId);
    }

    @bind public isLinkable(mumbleUser: MumbleUser) {
        return typeof mumbleUser.id !== "undefined" && (
            !this.allLinks.some(link => link.mumbleId === mumbleUser.id) ||
            this.isLinkedToThisUser(mumbleUser)
        );
    }

    @bind public isLinkedToThisUser(mumbleUser: MumbleUser) {
        return this.linksThisUser.some(link => mumbleUser.id === link.mumbleId);
    }

    @bind public isMumbleUserLinked(mumbleUser: MumbleUser) {
        return this.allLinks.some(link => mumbleUser.id === link.mumbleId);
    }

    @bind public isUserLinked(user: User) {
        return this.allLinks.some(link => user.id === link.user.id);
    }

    @bind public getUser(mumbleUser: MumbleUser) {
        if (!this.isMumbleUserLinked(mumbleUser)) { return; }
        const userId = this.allLinks.find(link => mumbleUser.id === link.mumbleId).user.id;
        return this.users.byId(userId);
    }

    @bind public getMumbleUser(user: User) {
        if (!this.isUserLinked(user)) { return; }
        const mumbleUserId = this.allLinks.find(link => user.id === link.user.id).mumbleId;
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
        this.links.set(link.id, link);
    }

    @bind @action public async unlink(mumbleUser: MumbleUser) {
        const mumbleLink = this.linksThisUser.find(link => link.mumbleId === mumbleUser.id);
        await this.mumbleLinks.deleteMumbleLink(mumbleLink.id);
        this.links.delete(mumbleLink.id);
    }

    @bind public async toggle(mumbleUser: MumbleUser) {
        if (this.isLinkedToThisUser(mumbleUser)) {
            await this.unlink(mumbleUser);
            return;
        }
        await this.link(mumbleUser);
    }
}

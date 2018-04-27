import { observable, computed, action } from "mobx";
import { bind } from "decko";
import { component, initialize, inject } from "tsdi";
import { Channel, Utilities, MumbleUser } from "../../common";

@component
export class MumbleStore {
    @inject private utilities: Utilities;

    @observable public channelTree: Channel;
    @observable public users: MumbleUser[];

    @initialize
    protected async initialize() {
        this.channelTree = await this.utilities.channelTree();
        this.users = await this.utilities.getMumbleUsers();
    }
}

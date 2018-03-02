import { observable, computed, action } from "mobx";
import { bind } from "decko";
import { component, initialize, inject } from "tsdi";

import { User, UserStats, Followership, Users, Followerships } from "../../common";

import { LoginStore } from ".";

@component("OwnUserStore")
export class OwnUserStore {
    @inject private users: Users;
    @inject private followerships: Followerships;
    @inject("LoginStore") private login: LoginStore;

    @observable public user: User;
    @observable public userStats: UserStats;
    @observable public following: Map<string, Followership> = new Map();
    @observable public followers: Map<string, Followership> = new Map();

    @initialize @bind @action
    public async loadUser() {
        if (this.login.loggedIn) {
            this.user = await this.users.getOwnUser(this.login.userId);
            this.userStats = await this.users.getUserStats(this.login.userId);
            (await this.followerships.getFollowing(this.user.id)).forEach(this.storeFollowing);
            (await this.followerships.getFollowers(this.user.id)).forEach(this.storeFollower);
        }
    }

    @bind
    private storeFollower(followership: Followership) {
        this.followers.set(followership.id, followership);
    }

    @bind
    private storeFollowing(fllowership: Followership) {
        this.following.set(fllowership.id, fllowership);
    }

    @computed public get allFollowing(): Followership[] {
        return Array.from(this.following.values());
    }

    @computed public get allFollowers(): Followership[] {
        return Array.from(this.followers.values());
    }

    public followingById(id: string) {
        return this.following.get(id);
    }

    public followerById(id: string) {
        return this.followers.get(id);
    }

    public followershipByFollowingId(id: string) {
        return Array.from(this.following.values()).find(followership => followership.followed.id === id);
    }

    public followershipByFollowerId(id: string) {
        return Array.from(this.followers.values()).find(followership => followership.follower.id === id);
    }

    @bind @action
    public async removeFollowing(userId: string) {
        const followership = this.followershipByFollowingId(userId);
        await this.followerships.deleteFollowership(followership.id);
        this.following.delete(followership.id);
    }

    @bind @action
    public async addFollowing(userId: string) {
        const followership = await this.followerships.createFollowership({
            follower: { id: this.user.id } as User,
            followed: { id: userId } as User,
        });
        this.storeFollowing(followership);
    }
}

import { observable, computed, action } from "mobx";
import { bind } from "decko";
import * as isomorphicFetch from "isomorphic-fetch";
import { History } from "history";
import { component, inject, initialize } from "tsdi";

import { Users, Tokens, User } from "../../common";
import { routeDashboard } from "../../common-ui";
import { GamesStore, OwnUserStore  } from ".";
import { ServiceWorkerManager } from "..";

const softwareVersion = 2;
const localStorageIdentifier = "software-login";

interface LocalStorageApi {
    readonly storageVersion: number;
    readonly date: string;
    readonly authToken: string;
    readonly userId: string;
}

interface ApiError {
    message: string;
}

@component("LoginStore")
export class LoginStore {
    @inject private users: Users;
    @inject private tokens: Tokens;
    @inject("OwnUserStore") private ownUser: OwnUserStore;
    @inject("GamesStore") private games: GamesStore;
    @inject private browserHistory: History;
    @inject("ServiceWorkerManager") private serviceWorkerManager: ServiceWorkerManager;

    @observable public authToken: string;
    @observable public userId: string;

    @initialize
    protected init() {
        this.load();
    }

    @computed
    public get loggedIn() {
        return typeof this.authToken !== "undefined" && typeof this.userId !== "undefined";
    }

    @bind @action
    public async login(email: string, password: string) {
        const body = { email, password };
        const response = await this.tokens.createToken({ email, password } as User);
        if (response) {
            const { id, user } = response;
            this.authToken = id;
            this.userId = user.id;
            this.save();
            await this.ownUser.loadUser();
            await this.games.loadGames();
            this.browserHistory.replace(routeDashboard.path());
            await this.serviceWorkerManager.updateSubscription();
        }
        return response;
    }

    @bind @action
    public logout() {
        this.clearStorage();
        this.authToken = undefined;
        this.userId = undefined;
        window.location.reload();
    }

    @bind
    private save() {
        const deserialized: LocalStorageApi = {
            storageVersion: softwareVersion,
            date: new Date().toString(),
            authToken: this.authToken,
            userId: this.userId,
        };
        const serialized = JSON.stringify(deserialized);
        localStorage.setItem(localStorageIdentifier, serialized);
    }

    @bind
    private clearStorage() {
        localStorage.removeItem(localStorageIdentifier);
    }

    @bind
    private load() {
        const serialized = localStorage.getItem(localStorageIdentifier);
        if (serialized === null) {
            return;
        }
        let deserialized: LocalStorageApi;
        try {
            deserialized = JSON.parse(serialized);
        } catch (err) {
            this.clearStorage();
            return;
        }
        if (deserialized.storageVersion !== softwareVersion) {
            this.clearStorage();
            return;
        }
        this.authToken = deserialized.authToken;
        this.userId = deserialized.userId;
    }
}

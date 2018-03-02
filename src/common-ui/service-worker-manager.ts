import { component, initialize, inject } from "tsdi";
import { bind } from "decko";

import { publicKey, urlB64ToUint8Array } from "../vapid-keys";
import { GamesStore, NotificationsStore, LoginStore } from ".";
import { Tokens } from "../common";

@component({ name: "ServiceWorkerManager", eager: true })
export class ServiceWorkerManager {
    @inject("LoginStore") private loginStore: LoginStore;
    @inject private tokens: Tokens;
    @inject private games: GamesStore;
    @inject("NotificationsStore") private notifications: NotificationsStore;

    private pushSubscription: PushSubscription;
    public registration: ServiceWorkerRegistration;

    public get hasSubscription() { return Boolean(this.pushSubscription); }

    public async updateSubscription() {
        if (!this.loginStore.loggedIn) {
            return;
        }
        await this.tokens.updatePushEndpoint(this.loginStore.authToken, this.pushSubscription.endpoint);
        this.games.disableAutoRefresh();
        this.notifications.useServiceWorkerApi();
    }

    @bind
    private async onPush(event: MessageEvent) {
        await this.games.refreshAll();
    }

    @bind
    private async onNotify(event: MessageEvent) {
        this.notifications.checkNotifications();
    }

    @initialize
    private async register() {
        if (!window.navigator || !window.navigator.serviceWorker) {
            return;
        }
        const { serviceWorker } = window.navigator;
        try {
            this.registration = await serviceWorker.register("/service-worker.js", {
                scope: "/",
            });
        }
        catch (err) {
            console.error("Unable to register service worker.", err);
            return;
        }
        if (!this.registration.active) {
            console.error("Serviceworker was not active after registering.");
            return;
        }
        try {
            this.pushSubscription = await this.registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlB64ToUint8Array(publicKey),
            });
            this.updateSubscription();
        } catch (err) {
            console.error("Unable to subscribe to push service.", err);
            return;
        }
        await serviceWorker.ready;
        serviceWorker.addEventListener("message", async (event: MessageEvent) => {
            switch (event.data as string) {
                case "push": {
                    this.onPush(event);
                    break;
                }
                case "notify": {
                    await this.onPush(event);
                    await this.onNotify(event);
                    break;
                }
                default: break;
            }
        });
        this.notifications.useServiceWorkerApi();
    }
}

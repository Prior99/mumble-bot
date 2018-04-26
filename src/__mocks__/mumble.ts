const userStrangerOne = {
    id: 4,
    name: "Stranger one",
    session: 84,
};

const userStrangerTwo = {
    id: 7,
    name: "Stranger two",
    session: 171,
};

const userStrangerThree = {
    id: 23,
    name: "Stranger three",
    session: 2134,
};

const userUnregistered = {
    name: "Unregistered Stranger",
    session: 2134,
};

const channelSubchild1 = {
    id: 3,
    name: "Subchild 1",
    position: 0,
    children: [],
    users: [userStrangerOne, userStrangerTwo],
};

const channelChild1 = {
    id: 1,
    name: "Child 1",
    position: 0,
    children: [channelSubchild1],
    users: [],
};

const channelChild2 = {
    id: 2,
    name: "Child 2",
    position: 1,
    children: [],
    users: [userStrangerThree],
};

const channelRoot = {
    id: 0,
    name: "Root",
    position: 0,
    children: [channelChild1, channelChild2],
    users: [userUnregistered],
};

export class MockMumbleConnection {
    private disconnectCallback: () => void;

    public mockUsers = [
        userStrangerOne,
        userStrangerTwo,
        userStrangerThree,
        userUnregistered,
    ];

    public mockChannels = [
        channelRoot,
        channelChild1,
        channelChild2,
        channelSubchild1,
    ];

    public on(eventName: string, callback) {
        if (eventName === "ready") {
            setTimeout(callback, 5);
            return;
        }
        if (eventName === "disconnect") {
            this.disconnectCallback = callback;
        }
    }

    public disconnect() {
        if (this.disconnectCallback) {
            this.disconnectCallback();
        }
    }

    public users() {
        return [ ...this.mockUsers ];
    }

    public channel() {
        return [ ...this.mockChannels ];
    }

    public authenticate() {
        return;
    }

    public get rootChannel() {
        return channelRoot;
    }

    public userById(id: number) {
        return this.mockUsers.find(user => (user as any).id === id);
    }
}

export function connect(url, options, callback) {
    callback(undefined, new MockMumbleConnection());
}

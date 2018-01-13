declare module "mumble" {
    interface InputStream extends NodeJS.WritableStream {
        close: () => void;
        setGain: (gain: number) => void;
        connection: Connection;
        channels: number;
        whisperId: number;
        sampleRate: number;
        gain: number;
        bitDepth: number;
        signed: boolean;
        endianness: "BE" | "LE";
        processInterval: NodeJS.Timer;
        processObserver: EventEmitter;
        frameQueue: Buffer[];
        lastFrame: Buffer;
        lastFrameWritten: number;
        queuedForPlay: number;
        lastWrite: number;
        sent: number;
    }

    interface OutputStream extends NodeJS.ReadableStream {
        close: () => void;
        connection: Connection;
        sessionId: number;
        eventEmitter: EventEmitter;
        frames: Buffer[];
        writtenUntil: number;
        noEmptyFrames: boolean;
        emptyFrame: Buffer;
        voiceListener: (data: Buffer) => void;
    }

    interface Channel {
        addSubChannel: (name: string, options: any) => void;
        getPermissions: (callback: () => any) => void;
        join: () => void;
        remove: () => void;
        sendMessage: (message: string) => void;
        children: Channel[];
        links: Channel[];
        users: User[];
        name: string;
        id: number;
        position: number;
    }

    interface User {
        channel: Channel;
        deaf: boolean;
        hash: string;
        id: number;
        mute: boolean;
        name: string;
        prioritySpeaker: boolean;
        recording: boolean;
        selfDeaf: boolean;
        selfMute: boolean;
        session: number;
        suppress: boolean;
        ban: (reason?: string) => void;
        canHear: () => boolean;
        canTalk: () => boolean;
        inputStream: () => InputStream;
        isRegistered: () => boolean;
        kick: (reason?: string) => void;
        moveToChannel: (channel: Channel) => void;
        outputStream: (noEmptyFrames?: boolean) => OutputStream;
        sendMessage: (message: string) => void;
        setComment: (comment: string) => void;
        setSelfDeaf: (isSelfDeaf: boolean) => void;
        setSelfMute: (isSelfMute: boolean) => void;
        on: (event: string, callback: (...args: any[]) => any) => void;
    }

    interface Options {
        key?: string;
        cert?: string;
        celtVersion?: string;
    }

    interface Connection {
        authenticate: (username: string, password: string) => void;
        users: () => User[];
        channelById: (id: number) => Channel;
        userById: (id: number) => User;
        channelByName: (name: string) => Channel;
        userByName: (name: string) => User;
        sendMessage: (name: string, data: string) => void;
        outputStream: (userId?: number) => OutputStream;
        inputStream: () => InputStream;
        disconnect: () => void;
        sendVoice: (chunk: Buffer) => void;
        on: (event: string, callback: (...args: any[]) => any) => void;
        ready: boolean;
        rootChannel: Channel;
        user: User;
    }

    function connect(url: string, options: Options, callback: (err: Error, connection: Connection) => void): void;
}

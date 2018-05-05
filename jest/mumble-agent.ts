import { createReadStream } from "fs";
import { connect, Connection, Options } from "mumble";

jest.unmock("mumble");

export class MumbleAgent {
    public connection: Connection;
    public name: string;
    public password: string;
    public keyCert: Options;
    public url: string;

    constructor(name: string, url: string, keyCert: Options, password?: string) {
        this.name = name;
        this.password = password;
        this.keyCert = keyCert;
        this.url = url;
    }

    public connect() {
        return new Promise((resolve, reject) => {
            connect(`mumble://${this.url}`, this.keyCert, (err, connection) => {
                if (err) { reject(err); }
                connection.on("error", (error) => console.error(error));
                connection.authenticate(this.name, this.password);
                this.connection = connection;
                connection.on("ready", () => resolve(connection));
            });
        });
    }

    public disconnect() {
        return new Promise(resolve => {
            this.connection.on("disconnect", () => resolve());
            this.connection.disconnect();
        });
    }

    public play() {
        const input = createReadStream(`${__dirname}/sin.pcm`);
        input.pipe(this.connection.inputStream());
        return new Promise(resolve => {
            setTimeout(resolve, 5000);
        });
    }

    public async reconnect() {
        await this.disconnect();
        await this.connect();
    }
}

export async function mumbleAgent(name: string, url: string, keyCert: Options, password?: string) {
    const agent = new MumbleAgent(name, url, keyCert, password);
    await agent.connect();
    return agent;
}

import { option, Options } from "clime";

export class MumbleConfig extends Options {
    @option({ name: "mumbleKeyFile", description: "Path to the SSL key file used to connect to mumble." })
    public key: string;

    @option({ name: "mumbleCertFile", description: "Path to the SSL certificate file used to connect to mumble." })
    public cert: string;

    @option({ flag: "n", description: "Name of the bot in Mumble." })
    public name: string;

    @option({ flag: "P", description: "Password used to connect to Mumble. "})
    public password: string;
}

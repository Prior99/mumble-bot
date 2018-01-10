import { option, Options } from "clime";

export class ApiConfig extends Options {
    @option({ flag: "p", description: "Port to host the API on." })
    public port: number;

    @option({ flag: "u", description: "Public Url on which the API will be reachable" })
    public url: string;
}

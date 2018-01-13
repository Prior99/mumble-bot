import { CLI, Shim } from "clime";

import { setupWinston } from "./common";

setupWinston();

const cli = new CLI("bot", `${__dirname}/commands`);
const shim = new Shim(cli);
shim.execute(process.argv);

import { CLI, Shim } from "clime";

const cli = new CLI("bot", `${__dirname}/commands`);
const shim = new Shim(cli);
shim.execute(process.argv);

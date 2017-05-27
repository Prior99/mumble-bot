import { watch } from "fs";

const config = require("../config.json"); // tslint:disable-line

watch(config.paths.tmp).on("change", (event) => {

});

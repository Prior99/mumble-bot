import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { getUserByUsername } from "../database";
import { AuthorizedApiEndpoint } from "./types";
import { Bot } from "..";
import { okay } from "./utils";

/**
 * Always returns okay. Should be authorized.
 */
export const Authorized: AuthorizedApiEndpoint = (bot: Bot) => async (req, res) => {
    okay(res);
};

import { Request, Response, NextFunction } from "express";
import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import * as Ws from "ws";
import { AuthorizedApiEndpoint, AuthorizedApiWsEndpoint, AuthorizedRequest } from "./types";
import { Bot } from "..";
import { checkLoginData, getUserByUsername } from "../database";

export function internalError(response: Response) {
    response.status(HTTP.INTERNAL_SERVER_ERROR).send({
        okay: false,
        message: "An internal server error occured."
    });
}

export function okay(response: Response, data?: any) {
    response.status(HTTP.OK);
    if (data) {
        response.send({
            okay: true,
            message: "OK"
        });
        return;
    }
    response.send({
        okay: true,
        message: "OK",
        data
    });
}

export function notFound(response: Response, message: string = "Not found.") {
    response.status(HTTP.OK).send({
        okay: false,
        message
    });
}

export function badRequest(response: Response, message: string = "Bad Request.") {
    response.status(HTTP.BAD_REQUEST).send({
        okay: false,
        message
    });
}

export function missingArguments(response: Response, message: string = "Missing arguments.") {
    response.status(HTTP.BAD_REQUEST).send({
        okay: false,
        message
    });
}

export function conflict(response: Response, message: string) {
    response.status(HTTP.CONFLICT).send({
        okay: false,
        message
    });
}

export function forbidden(response: Response) {
    response.status(HTTP.FORBIDDEN).send({
        okay: false,
        message: "Forbidden."
    });
}

function parseAuthToken(request: Request): { username: string, password: string } {
    const { authorization } = request.headers;
    if (!authorization) {
        return;
    }
    if (!authorization.toLowerCase().startsWith("basic")) {
        return;
    }
    const token = new Buffer(authorization.substr(6), 'base64').toString('utf8');
    const [username, password] = token.split(':');
    return { username, password };
}

async function validateRequestLoginData(request: Request, bot: Bot): Promise<boolean> {
    const auth = parseAuthToken(request);
    if (!auth) {
        return false;
    }
    const { username, password } = auth;
    return await checkLoginData(username, password, bot.database);
}

export function authorized(endpoint: AuthorizedApiEndpoint): AuthorizedApiEndpoint {
    return (bot: Bot) => async (request: Request, response: Response, next: NextFunction) => {
        if (!await validateRequestLoginData(request, bot)) {
            return forbidden(response);
        }
        const { username } = parseAuthToken(request);
        try {
            const authorizedRequest = request as AuthorizedRequest;
            authorizedRequest.user = await getUserByUsername(username, bot.database);
            return endpoint(bot)(authorizedRequest, response, next);
        } catch (err) {
            Winston.error(`Error when loading data for user ${username}`, err);
            return internalError(response)
        }
    };
}

export function authorizedWebsocket(endpoint: AuthorizedApiWsEndpoint): AuthorizedApiWsEndpoint {
    return (bot: Bot) => async (ws: Ws, request: Request, next: NextFunction) => {
        if (!await validateRequestLoginData(request, bot)) {
            return;
        }
        const { username } = parseAuthToken(request);
        try {
            const authorizedRequest = request as AuthorizedRequest;
            authorizedRequest.user = await getUserByUsername(username, bot.database);
            return endpoint(bot)(ws, authorizedRequest, next);
        } catch (err) {
            Winston.error(`Error when loading data for user ${username}`, err);
            return;
        }
    };
}

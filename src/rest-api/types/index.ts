import { Handler, Router, Response, Request, NextFunction } from "express";
import * as Ws from "ws";
import { Bot } from "../..";
import { DatabaseUser } from "../../types";

interface ExtendedRequest extends Request {
    user: DatabaseUser;
}

export type ApiWsEndpoint = (bot: Bot) => (ws: Ws, req: ExtendedRequest) => void;

export type ApiEndpoint = (bot: Bot) => (req: ExtendedRequest, res?: Response, next?: NextFunction) => void;

export type ApiRoute = (bot: Bot) => Router;

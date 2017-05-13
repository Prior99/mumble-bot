import { Handler, Router, Response, Request, NextFunction } from "express";
import * as Ws from "ws";
import { Bot } from "../..";
import { DatabaseUser } from "../../types";

export interface AuthorizedRequest extends Request {
    user: DatabaseUser;
}

export type ApiWsEndpoint = (bot: Bot) => (ws: Ws, req: Request) => void;

export type ApiEndpoint = (bot: Bot) => (req: Request, res?: Response, next?: NextFunction) => void;

export type AuthorizedApiEndpoint = (bot: Bot) => (req: AuthorizedRequest, res?: Response, next?: NextFunction) => void;

export type AuthorizedApiWsEndpoint = (bot: Bot) => (ws: Ws, req: AuthorizedRequest, next?: NextFunction) => void;

export type ApiRoute = (bot: Bot) => Router;

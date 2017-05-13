import { Response } from "express";
import * as HTTP from "http-status-codes";

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

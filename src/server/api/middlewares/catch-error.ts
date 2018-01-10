import { Request, Response, NextFunction } from "express";
import { error as reportError } from "winston";

export function catchError(err: Error, req: Request, res: Response, next: NextFunction) {
    next();
    reportError("An error occured:", err);
    res.status(500).send({ error: "Internal error." });
}

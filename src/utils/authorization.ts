import { Request } from "express";

export function getAuthTokenId(req: Request) {
    const header = req.get("authorization");
    if (!header) { return; }
    if (header.substr(0, 7) !== "Bearer ") { return; }
    return header.substring(7, header.length);
}

import { createHmac } from "crypto";

const SECRET = "sabQWna8neP";

export function hash(value: string) {
    return createHmac("sha256", SECRET).update(value).digest("hex");
}

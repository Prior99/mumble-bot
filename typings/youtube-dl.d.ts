import * as YoutubeDl from "youtube-dl";

declare module "youtube-dl" {
    export interface Info {
        id: string;
        title: string;
        url: string;
        thumbnail: string;
        description: string;
        _filename: string;
        format_id: number;
    }

    export type GetInfoCallback = (err: Error, info: Info) => void;
    export function getInfo(url: string, options: string[], callback: GetInfoCallback): void;
}

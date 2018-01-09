import { body, controller, route, param, is, uuid, ok } from "hyrest";
import { component, inject } from "tsdi";
import { Connection } from "typeorm";

import { Recording } from "../models";
import { createRecording } from "../scopes";

@controller @component
export class Recordings {
    @inject private db: Connection;

    @route("GET", "/recording/:id")
    public async getRecording(@param("id") @is().validate(uuid) id: string): Promise<Recording> {
        return ok();
    }

    @route("POST", "/recording/:id")
    public async postRecording(
        @param("id") @is().validate(uuid) id: string,
        @body(createRecording) recording: Recording
    ): Promise<Recording> {
        return ok();
    }

    @route("GET", "/recordings")
    public async listRecordings(): Promise<Recording> {
        return ok();
    }

    @route("POST", "/recording/:id/play")
    public async playRecording(@param("id") @is().validate(uuid) id: string): Promise<{}> {
        return ok();
    }

    @route("POST", "/recording/:id/fork")
    public async forkRecording(@param("id") @is().validate(uuid) id: string): Promise<{}> {
        return ok();
    }
}

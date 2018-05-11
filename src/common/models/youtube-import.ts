import { is, scope, required } from "hyrest";
import { youtubeImport } from "../scopes";

export class YoutubeImport {
    @is().validate(required) @scope(youtubeImport)
    public url?: string;
}

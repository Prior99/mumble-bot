import { is, scope, required } from "hyrest";
import { upload } from "../scopes";

export class Upload {
    @is().validate(required) @scope(upload)
    public content?: string;

    @is().validate(required) @scope(upload)
    public filename?: string;
}

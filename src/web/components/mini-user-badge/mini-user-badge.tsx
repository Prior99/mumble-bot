import * as React from "react";
import { Link } from "react-router-dom";
import { Image, SemanticICONS } from "semantic-ui-react";
import { User } from "../../../common";
import { routeUser } from "../../routing";
import * as css from "./mini-user-badge.scss";

export function MiniUserBadge({ user }: { user: User }) {
    return (
        <Link to={routeUser.path(user.id)}>
            <Image className={css.avatar} size="mini" avatar src={user.avatarUrl} />
            {user.name}
        </Link>
    );
}

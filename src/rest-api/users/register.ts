import * as Winston from "winston";
import { getUserById, registerUser } from "../../database";

/**
 * Grants all permissions to the user with the id 1. (The first registered user is admin).
 * @return {undefined}
 */
async function grantAll(bot) {
    try {
        const user = await getUserById(1, bot.database);
        bot.permissions.grantAllPermissions(null, user);
    }
    catch (err) {
        Winston.error("Error when granting all permissions to user with id 0.", err);
    }
}

/**
 * Register a new user on the server.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
export const Register = (bot) => async (req, res) => {
    const { email, username, password } = req.body;
    try {
        const id = await registerUser({ email, username, password }, bot.database);
        Winston.debug("verbose", `A new user registered: ${username}`);
        if (id === 1) {
            Winston.debug("verbose", `Granted all permissions to user '${username}'`);
            grantAll(bot);
        }
        res.send({ id });
    }
    catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            res.send({
                reason: "username_taken"
            });
        }
        else {
            Winston.error("Error registering new user: ", err);
            res.send({
                reason: "internal_error"
            });
        }
    }
};

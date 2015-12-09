/*
 * Includes
 */
import Winston from "winston";

/*
 * Code
 */

/**
 * Handles permissions in the bot.
 * This is basically just a nicer-to-use interface to the database.
 */
class Permissions {

	/**
	 * @param {Database} database - The database of the bot to use.
	 * @constructor
	 */
	constructor(database) {
		this.database = database;
	}

	/**
	 * Checks whether a user has the given permission.
	 * @param {User} user - User to check the permission of.
	 * @param {string} permission - Permission to check.
	 * @param {function} callback - This callback is called when the data was fetched.
	 * @returns {undefined}
	 */
	hasPermission(user, permission, callback) {
		if(!user) {
			callback(false);
			return;
		}
		this.database.hasPermission(user.id, permission, (err, has) => {
			if(err) {
				Winston.error("Could not check whether user has permission", err);
			}
			callback(!err && has);
		});
	}

	/**
	 * Checks whether a user has the given permission and executes the callback if
	 * does. Otherwise logs a warning.
	 * @param {User} user - User to check the permission of.
	 * @param {string} permission - Permission to check.
	 * @param {function} callback - This callback is called when the permission was available.
	 * @returns {undefined}
	 */
	requirePermission(user, permission, callback) {
		if(!user) {
			Winston.warn("Unknown user tried to execute something which required permission \"" + permission + "\"");
			return;
		}
		else {
			this.hasPermission(user, permission, (has) => {
				if(has) {
					callback();
				}
				else {
					Winston.warn("User " + user.username + " tried to execute something which required permission \""
						+ permission + "\"");
				}
			});
		}
	}

	/**
	 * Grants the permission to a user. If the issuer is null or undefined, no
	 * checks will be performed. If the issuer is defined, a check will be performed
	 * whether the issuer can grant the requested permission at all.
	 * @param {User} issuer - User that issues this command.
	 * @param {User} user - User to grant the permission to.
	 * @param {string} permission - Permission to grant to the user.
	 * @param {function} callback - Will be called after the permission was granted.
	 * @returns {undefined}
	 */
	grantPermission(issuer, user, permission, callback) {
		if(!callback) {
			callback = function() {};
		}
		this.hasPermission(issuer, "grant", grant => {
			this.hasPermission(issuer, permission, perm => {
				if(!issuer || (grant && perm)) {
					this.database.grantPermission(user.id, permission, err => {
						if(err) {
							Winston.error("Error when granting permission \"" + permission + "\" to user "
								+ user.username + ".", err);
							callback(false);
						}
						else {
							Winston.info("Permission \"" + permission + "\" was granted to user " + user.username);
							callback(true);
						}
					});
				}
				else {
					callback(false);
				}
			});
		});
	}

	/**
	 * Revokes a certain permission from a user. If the issuer is null or undefined, no
	 * checks will be performed. If the issuer is defined, a check will be performed
	 * whether the issuer can revoke the requested permission at all.
	 * @param {User} issuer - User that issues this command.
	 * @param {User} user - User to revoke the permission from.
	 * @param {string} permission - Permission to grant to the user.
	 * @param {function} callback - Will be called after the permission was revoked.
	 * @returns {undefined}
	 */
	revokePermission(issuer, user, permission, callback) {
		if(!callback) {
			callback = function() {};
		}
		this.hasPermission(issuer, "grant", grant => {
			this.hasPermission(issuer, permission, perm => {
				if(!issuer || (grant && perm)) {
					this.database.revokePermission(user.id, permission, err => {
						if(err) {
							Winston.error("Error when revoking permission \"" + permission + "\" from user "
								+ user.username + " by user " + issuer.username + ".", error);
							callback(false);
						}
						else {
							Winston.info("Permission \"" + permission + "\" was revoked from user " + user.username);
							callback(true);
						}
					});
				}
				else {
					callback(false);
				}
			});
		});
	}

	/**
	 * Retrieve information about a given permission.
	 * @param {string} permission - Permission to gather information about.
	 * @param {function} callback - Called once the inforamtion was retrieved.
	 * @returns {undefined}
	 */
	getPermission(permission, callback) {
		this.database.getPermission(permission, (err, permission) => {
			if(err) {
				Winston.error("Error when getting permission \"" + permission + "\".", err);
				callback();
			}
			else {
				callback(permission);
			}
		});
	}


	/**
	 * Retrieve an array containing all permissions known to this bot.
	 * @param {function} callback - Called once the list was retrieved.
	 * @returns {undefined}
	 */
	listPermissions(callback) {
		this.database.listPermissions((err, permissions) => {
			if(err) {
				Winston.error("Error when listing permissions.", err);
				callback([]);
			}
			else {
				callback(permissions);
			}
		});
	}

	/**
	 * Grants all known permissions to one user. If the issuer is null or undefined
	 * no checking will be performed. Else it will be checked if the issuer can
	 * grant the requested permissions at all and only those he can grant will be
	 * granted.
	 * @param {User} issuer - User that issued this command.
	 * @param {User} user - User to grant the permissions to.
	 * @param {function} callback - Called once all permissions were processed.
	 * @returns {undefined}
	 */
	grantAllPermissions(issuer, user, callback) {
		if(!callback) {
			callback = function() {};
		}
		this.listPermissions(permissions => {
			let okay = true;
			const next = function() {
				permission = permissions.shift();
				this.grantPermission(issuer, user, permission.id, ok => {
					if(!ok) {
						okay = false;
					}
					if(permissions.length > 0) {
						next();
					}
					else {
						callback(okay);
					}
				});
			}.bind(this);
			next();
		});
	}

	/**
	 * Lists all permissions from the view of a single user. Information about
	 * whether the user has the permission and whether the issuer can grant it will be added.
	 * @param {User} issuer - User that issued the command and of which it should be
	 *  			   checked whether he can grant the permissions.
	 * @param {User} user - User of which it should be checked whether he has the permissions.
	 * @param {function} callback - Called once the list was retrieved.
	 * @returns {undefined}
	 */
	listPermissionsForUser(issuer, user, callback) {
		const array = [];

		const iteratePermissions = function(permissions, issuerCanGrant) {
			if(permissions.length > 0) {
				const permission = permissions.shift();
				this.hasPermission(user, permission.id, has => {
					permission.granted = has;
					this.hasPermission(issuer, permission.id, has => {
						permission.canGrant = has && issuerCanGrant;
						array.push(permission);
						iteratePermissions(permissions, issuerCanGrant);
					});
				});
			}
			else {
				callback(array);
			}
		}.bind(this)

		this.hasPermission(issuer, "grant", issuerCanGrant => {
			this.listPermissions(permissions => {
				iteratePermissions(permissions, issuerCanGrant);
			});
		});
	}

	/**
	 * TODO
	 * @param {User} user TODO
	 * @param {function} callback TODO
	 * @returns {undefined}
	 */
	listPermissionsAssocForUser(user, callback) {
		const obj = {};
		const iteratePermissions = function(permissions) {
			if(permissions.length > 0) {
				const permission = permissions.shift();
				this.hasPermission(user, permission.id, has => {
					obj[permission.id] = has;
					iteratePermissions(permissions);
				});
			}
			else {
				callback(obj);
			}
		}.bind(this)

		this.listPermissions(permissions => {
			iteratePermissions(permissions);
		});
	}
}

module.exports = Permissions;

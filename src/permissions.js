/*
 * Includes
 */
var Winston = require('winston');

/*
 * Code
 */

/**
 * Handles permissions in the bot.
 * This is basically just a nicer-to-use interface to the database.
 * @constructor
 * @param database - The database of the bot to use.
 */
var Permissions = function(database) {
	this.database = database;
};

/**
 * Checks whether a user has the given permission.
 * @param user - User to check the permission of.
 * @param {string} permission - Permission to check.
 * @param callback - This callback is called when the data was fetched.
 */
Permissions.prototype.hasPermission = function(user, permission, callback) {
	if(!user) {
		callback(false);
		return;
	}
	this.database.hasPermission(user.id, permission, function(err, has) {
		if(err) {
			Winston.error("Could not check whether user has permission" , err);
		}
		callback(!err && has);
	});
};

/**
 * Grants the permission to a user. If the issuer is null or undefined, no
 * checks will be performed. If the issuer is defined, a check will be performed
 * whether the issuer can grant the requested permission at all.
 * @param issuer - User that issues this command.
 * @param user - User to grant the permission to.
 * @param {string} permission - Permission to grant to the user.
 * @param callback - Will be called after the permission was granted.
 */
Permissions.prototype.grantPermission = function(issuer, user, permission, callback) {
	if(!callback) {
		callback = function(){};
	}
	this.hasPermission(issuer, "grant", function(grant) {
		this.hasPermission(issuer, permission, function(perm) {
			if(!issuer || (grant && perm)) {
				this.database.grantPermission(user.id, permission, function(err) {
					if(err) {
						Winston.error("Error when granting permission \"" + permission + "\" to user " + user.username + ".", err);
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
		}.bind(this));
	}.bind(this));
};

/**
 * Revokes a certain permission from a user. If the issuer is null or undefined, no
 * checks will be performed. If the issuer is defined, a check will be performed
 * whether the issuer can revoke the requested permission at all.
 * @param issuer - User that issues this command.
 * @param user - User to revoke the permission from.
 * @param {string} permission - Permission to grant to the user.
 * @param callback - Will be called after the permission was revoked.
 */
Permissions.prototype.revokePermission = function(issuer, user, permission, callback) {
	if(!callback) {
		callback = function(){};
	}
	this.hasPermission(issuer, "grant", function(grant) {
		this.hasPermission(issuer, permission, function(perm) {
			if(!issuer || (grant && perm)) {
				this.database.revokePermission(user.id, permission, function(err) {
					if(err) {
						Winston.error("Error when revoking permission \"" + permission + "\" from user " + user.username + " by user " + issuer.username + ".", error);
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
		}.bind(this));
	}.bind(this));
};

/**
 * Retrieve information about a given permission.
 * @param {string} permission - Permission to gather information about.
 * @param callback - Called once the inforamtion was retrieved.
 */
Permissions.prototype.getPermission = function(permission, callback) {
	this.database.getPermission(permission, function(err, permission) {
		if(err) {
			Winston.error("Error when getting permission \"" + permission + "\".", err);
			callback();
		}
		else {
			callback(permission);
		}
	});
};


/**
 * Retrieve an array containing all permissions known to this bot.
 * @param callback - Called once the list was retrieved.
 */
Permissions.prototype.listPermissions = function(callback) {
	this.database.listPermissions(function(err, permissions) {
		if(err) {
			Winston.error("Error when listing permissions.", err);
			callback([]);
		}
		else {
			callback(permissions);
		}
	});
};

/**
 * Grants all known permissions to one user. If the issuer is null or undefined
 * no checking will be performed. Else it will be checked if the issuer can
 * grant the requested permissions at all and only those he can grant will be
 * granted.
 * @param issuer - User that issued this command.
 * @param user - User to grant the permissions to.
 * @param callback - Called once all permissions were processed.
 */
Permissions.prototype.grantAllPermissions = function(issuer, user, callback) {
	if(!callback) {
		callback = function(){};
	}
	this.listPermissions(function(permissions) {
		var okay = true;
		var next = function() {
			permission = permissions.shift();
			this.grantPermission(issuer, user, permission.id, function(ok) {
				if(!ok){
					okay = false;
				}
				if(permissions.length  > 0) {
					next();
				}
				else {
					callback(okay);
				}
			});
		}.bind(this);
		next();
	}.bind(this));
};

/**
 * Lists all permissions from the view of a single user. Information about
 * whether the user has the permission and whether the issuer can grant it
 * will be added.
 * @param issuer - User that issued the command and of which it should be
 *  			   checked whether he can grant the permissions.
 * @param user - User of which it should be checked whether he has the
 *  			 permissions.
 * @param callback - Called once the list was retrieved.
 */
Permissions.prototype.listPermissionsForUser = function(issuer, user, callback) {
	var array = [];

	var iteratePermissions = function(permissions, issuerCanGrant) {
		if(permissions.length > 0) {
			var permission = permissions.shift();
			this.hasPermission(user, permission.id, function(has) {
				permission.granted = has;
				this.hasPermission(issuer, permission.id, function(has) {
					permission.canGrant = has && issuerCanGrant;
					array.push(permission);
					iteratePermissions(permissions, issuerCanGrant);
				});
			}.bind(this));
		}
		else {
			callback(array);
		}
	}.bind(this)

	this.hasPermission(issuer, "grant", function(issuerCanGrant) {
		this.listPermissions(function(permissions) {
			iteratePermissions(permissions, issuerCanGrant);
		});
	}.bind(this));
};


module.exports = Permissions;

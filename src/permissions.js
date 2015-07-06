/*
 * Includes
 */
var Winston = require('winston');

/*
 * Code
 */
var Permissions = function(database) {
	this.database = database;
};

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


module.exports = Permissions;

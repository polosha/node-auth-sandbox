var redis = require('redis');
var bcrypt = require('bcrypt');

var db = redis.createClient();

module.exports = User;

function User(obj) {
	for (var key in obj) {
		this[key] = obj[key];	
	}
}

User.prototype = function(fn) {
	if (this.id) {
		this.update(fn);
	} else {
		var user = this;
		db.incr('user:ids', function(err, id) {
			if (err) return fn(err);
			user.id = id;
			user.hashPassword( function(err) {
				if (err) return fn(err);
				user.update(fn);
			});
		});
	}
}

User.prototype.update = function(fn) {
	var user = this;
	var id = user.id;
	db.set('user:id:'+ user.name, id, function(err) {
		if (err) return fn(err);
		db.hmset('user:'+id, user, function(err) {
			fn(err);
		});
	});
}

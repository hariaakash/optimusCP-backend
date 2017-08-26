var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Server = require('./server');


mongoose.Promise = global.Promise;


var userSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: String,
	info: {
		name: String,
		address: String,
		city: String,
		state: String,
		country: String,
		set: {
			type: Boolean,
			default: false
		}
	},
	conf: {
		verified: String,
		plan: {
			type: Number,
			default: 1
		},
		pVerify: String,
		block: {
			type: Boolean,
			default: false
		}
	},
	stats: {
		bought: {
			type: Number,
			default: 0
		},
		added: {
			type: Number,
			default: 0
		},
		credits: {
			type: Number,
			default: 0
		},
		usage: {
			type: Number,
			default: 0
		},
		tickets: {
			open: {
				type: Number,
				default: 0
			},
			closed: {
				type: Number,
				default: 0
			}
		}
	},
	authKey: String,
	apis: [{
		name: String,
		key: String,
		logs: [{
			ip: String,
			cmd: String,
			error: String,
			result: String,
			date: {
				type: Date,
				default: Date.now
			}
		}],
		hits: {
			type: Number,
			default: 0
		},
		enabled: {
			type: Boolean,
			default: true
		}
	}],
	tickets: [{
		status: {
			type: String,
			default: "open"
		},
		sub: String,
		conv: [{
			msg: String,
			person: {
				type: Boolean,
				default: 0
			},
			date: {
				type: Date,
				default: Date.now
			}
		}]
	}],
	added: [Server],
	logs: [{
		ip: String,
		msg: String,
		date: {
			type: Date,
			default: Date.now
		}
	}],
	teams: [{
		name: String,
		admin: {
			type: Boolean,
			default: 1
		}
	}]
});


module.exports = mongoose.model('User', userSchema);

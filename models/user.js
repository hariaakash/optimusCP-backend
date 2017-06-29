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
		fname: String,
		lname: String,
		country: String
	},
	conf: {
		verified: String,
		plan: {
			type: Number,
			default: 1
		},
		pVerify: String
	},
	stats: {
		bought: {
			type: Number,
			default: 0
		},
		managed: {
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
		}
	},
	authKey: String,
	managed: [Server]
});


module.exports = mongoose.model('User', userSchema);

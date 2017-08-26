var mongoose = require('mongoose');
var Schema = mongoose.Schema;


mongoose.Promise = global.Promise;


var adminSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true
	},
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
	block: {
		type: Boolean,
		default: false
	},
	role: {
		type: String,
		default: 'admin'
	},
	password: String,
	adminKey: String,
	logs: [{
		ip: String,
		msg: String,
		date: {
			type: Date,
			default: Date.now
		}
	}]
});


module.exports = mongoose.model('Admin', adminSchema);

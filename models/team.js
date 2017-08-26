var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Server = require('./server');


mongoose.Promise = global.Promise;


var teamSchema = new Schema({
	name: String,
	admin: String,
	members: [{
		uId: String,
		email: String
	}],
	added: [Server],
	logs: [{
		ip: String,
		msg: String,
		date: {
			type: Date,
			default: Date.now
		}
	}]
});


module.exports = mongoose.model('Team', teamSchema);

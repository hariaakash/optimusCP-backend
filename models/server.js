var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

var serverSchema = new Schema({
	ip: {
		type: String,
		required: true,
		unique: true,
		sparse: true
	},
	port: Number,
	name: String,
	info: {
		os: String,
		hname: String
	},
	uname: String,
	metrics: [{
		m_t: Number,
		m_u: Number,
		d_t: Number,
		d_u: Number,
		date: {
			type: Date,
			default: Date.now
		}
	}],
	crons: [{
		cmd: String,
		exp: String,
		enabled: {
			type: Boolean,
			default: true
		}
	}],
	startupScripts: [{
		cmd: String,
		enabled: {
			type: Boolean,
			default: true
		}
	}],
	logs: [{
		type: String,
		log: String,
		date: {
			type: Date,
			default: Date.now
		}
	}]
});

module.exports = serverSchema;

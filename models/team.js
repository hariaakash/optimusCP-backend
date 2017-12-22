var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Server = require('./server');


mongoose.Promise = global.Promise;


var teamSchema = new Schema({
    name: String,
    conf: {
        block: {
            type: Boolean,
            default: false
        }
    },
    members: [{
        _id: String,
        email: String,
        role: {
            type: Number,
            default: 2
        }
    }],
    added: [Server],
    logs: [{
        ip: String,
        user: String,
        msg: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
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
    }]
});


module.exports = mongoose.model('Team', teamSchema);

// perms role: 1- delete or add member and server, 2- normal perms

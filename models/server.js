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
    authType: Number,
    name: String,
    info: {
        os: String,
        hname: String
    },
    msgboard: {
        msg: String,
        time: Number,
        date: {
            type: Date,
            default: Date.now
        }
    },
    stack: {
        id: Number
    },
    metrics: [{
        m_t: Number,
        m_u: Number,
        d_t: Number,
        d_u: Number,
        d: Number,
        m: Number,
        cpu: Number,
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
    alerts: {
        cpu: {
            interval: Number,
            val: Number,
            enabled: {
                type: Boolean,
                default: false
            },
            current: {
                type: Date,
                default: Date.now
            }
        },
        m: {
            interval: Number,
            val: Number,
            enabled: {
                type: Boolean,
                default: false
            },
            current: {
                type: Date,
                default: Date.now
            }
        },
        d: {
            interval: Number,
            val: Number,
            enabled: {
                type: Boolean,
                default: false
            },
            current: {
                type: Date,
                default: Date.now
            }
        }

    },
    logs: [{
        msg: String,
        ip: String,
        user: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    monitorLogs: [{
        isReachable: {
            type: Boolean,
            default: true
        },
        start: {
            type: Date,
            default: Date.now
        },
        current: {
            type: Date,
            default: Date.now
        }
    }]
});

module.exports = serverSchema;

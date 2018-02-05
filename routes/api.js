var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var node_ssh = require('node-ssh');
ssh = new node_ssh();
var User = require('../models/user');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


//Responder
var uniR = require('../controllers/uniR');

app.get('/servers', function(req, res) {
    if (req.headers.apikey) {
        User.findOne({
                'apis.key': req.headers.apikey
            })
            .then(function(user) {
                if (user) {
                    var servers = [];
                    for (i = 0; i < user.added.length; i++)
                        servers.push({
                            id: user.added[i]._id,
                            name: user.added[i].name,
                            ip: user.added[i].ip,
                            port: user.added[i].port,
                            info: user.added[i].info
                        });
                    res.json({
                        status: true,
                        servers: servers
                    });
                } else {
                    uniR(res, false, 'Account not found !!');
                }
            })
            .catch(function(err) {
                uniR(res, false, 'Error when querying - Server Error !!');
            });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});

app.get('/tservers', function(req, res) {
    if (req.headers.apikey) {
        Team.findOne({
                'apis.key': req.headers.apikey
            })
            .then(function(team) {
                if (team) {
                    var servers = [];
                    for (i = 0; i < team.added.length; i++)
                        servers.push({
                            id: team.added[i]._id,
                            name: team.added[i].name,
                            ip: team.added[i].ip,
                            port: team.added[i].port,
                            info: team.added[i].info
                        });
                    res.json({
                        status: true,
                        servers: servers
                    });
                } else {
                    uniR(res, false, 'Account not found !!');
                }
            })
            .catch(function(err) {
                uniR(res, false, 'Error when querying - Server Error !!');
            });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});

app.get('/server', function(req, res) {
    if (req.headers.apikey && req.query.serverId) {
        User.findOne({
                'apis.key': req.headers.apikey
            })
            .then(function(user) {
                if (user) {
                    if ((i = user.added.findIndex(x => x._id == req.query.serverId)) >= 0) {
                        var server = user.added[i];
                        res.json({
                            status: true,
                            data: {
                                id: String(server._id),
                                ip: server.ip,
                                port: server.port,
                                name: server.name,
                                info: server.info,
                                crons: server.crons.length,
                                startupScripts: server.startupScripts.length,
                                monitor: server.monitorLogs[server.monitorLogs.length - 1].isReachable
                            }
                        });
                    } else {
                        uniR(res, false, 'Server Id wrong !!');
                    }
                } else {
                    uniR(res, false, 'Account not found !!');
                }
            })
            .catch(function(err) {
                uniR(res, false, 'Error when querying - Server Error !!');
            });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});

app.get('/tserver', function(req, res) {
    if (req.headers.apikey && req.query.serverId) {
        Team.findOne({
                'apis.key': req.headers.apikey
            })
            .then(function(team) {
                if (team) {
                    if ((i = team.added.findIndex(x => x._id == req.body.serverId)) >= 0) {
                        var server = team.added[i];
                        res.json({
                            status: true,
                            data: {
                                id: String(server._id),
                                ip: server.ip,
                                port: server.port,
                                name: server.name,
                                info: server.info,
                                crons: server.crons.length,
                                startupScripts: server.startupScripts.length,
                                monitor: server.monitorLogs[server.monitorLogs.length - 1].isReachable
                            }
                        });
                    } else {
                        uniR(res, false, 'Server Id wrong !!');
                    }
                } else {
                    uniR(res, false, 'Account not found !!');
                }
            })
            .catch(function(err) {
                uniR(res, false, 'Error when querying - Server Error !!');
            });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});

app.post('/server/exec', function(req, res) {
    if (req.headers.apikey && req.body.serverId && req.body.cmd) {
        User.findOne({
                'apis.key': req.headers.apikey
            })
            .then(function(user) {
                if (user) {
                    if ((index = user.added.findIndex(x => x._id == req.body.serverId)) >= 0) {
                        ssh.connect({
                                host: user.added[index].ip,
                                port: user.added[index].port,
                                username: 'optimusCP',
                                password: String(user.added[index]._id)
                            })
                            .then(function() {
                                ssh.execCommand('sudo sh -c "' + req.body.cmd + '"')
                                    .then(function(result) {
                                        if ((aId = user.apis.findIndex(x => x.key == req.headers.apiKey)) >= 0) {
                                            user.apis[aId].hits += 1;
                                            user.apis[aId].logs.push({
                                                ip: user.added[index].ip,
                                                cmd: req.body.cmd,
                                                error: result.stderr,
                                                result: result.stdout
                                            });
                                            user.save();
                                        }
                                        res.json({
                                            status: true,
                                            error: result.stdout,
                                            result: result.stderr
                                        });
                                    });
                            })
                            .catch(function(err) {
                                res.json({
                                    status: false,
                                    msg: 'Session Timed out',
                                    error: err
                                });
                            });
                    } else {
                        uniR(res, false, 'Server Id wrong !!');
                    }
                } else {
                    uniR(res, false, 'Account not found !!');
                }
            })
            .catch(function(err) {
                uniR(res, false, 'Error when querying - Server Error !!');
            });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});

app.post('/tserver/exec', function(req, res) {
    if (req.headers.apikey && req.body.serverId && req.body.cmd) {
        Team.findOne({
                'apis.key': req.headers.apikey
            })
            .then(function(team) {
                if (team) {
                    if ((index = team.added.findIndex(x => x._id == req.body.serverId)) >= 0) {
                        ssh.connect({
                                host: team.added[index].ip,
                                port: team.added[index].port,
                                username: 'optimusCP',
                                password: String(team.added[index]._id)
                            })
                            .then(function() {
                                ssh.execCommand('sudo sh -c "' + req.body.cmd + '"')
                                    .then(function(result) {
                                        if ((aId = team.apis.findIndex(x => x.key == req.headers.apiKey)) >= 0) {
                                            team.apis[aId].hits += 1;
                                            team.apis[aId].logs.push({
                                                ip: team.added[index].ip,
                                                cmd: req.body.cmd,
                                                error: result.stderr,
                                                result: result.stdout
                                            });
                                            team.save();
                                        }
                                        res.json({
                                            status: true,
                                            error: result.stdout,
                                            result: result.stderr
                                        });
                                    });
                            })
                            .catch(function(err) {
                                res.json({
                                    status: false,
                                    msg: 'Session Timed out',
                                    error: err
                                });
                            });
                    } else {
                        uniR(res, false, 'Server Id wrong !!');
                    }
                } else {
                    uniR(res, false, 'Account not found !!');
                }
            })
            .catch(function(err) {
                uniR(res, false, 'Error when querying - Server Error !!');
            });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});


module.exports = app;

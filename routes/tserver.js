var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var node_ssh = require('node-ssh');
ssh = new node_ssh();
var requestIp = require('request-ip');
var moment = require('moment');
var multer = require('multer');
var fs = require('fs');
var hat = require('hat');
var User = require('../models/user');
var Team = require('../models/team');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


//Responder
var uniR = require('../controllers/uniR');

// Bytes to Readable
var formatBytes = require('../controllers/formatBytes');

//Check uptime
require('../controllers/tserver/checkServerUptime')();

//Retrieve team info
function checkUserInTeam(uId, teamId) {
    return new Promise(function(resolve, reject) {
        // team = user is part of team, false = not part
        Team.findById(teamId)
            .then(function(team) {
                if (team) {
                    if ((x = team.members.findIndex(x => x._id == uId)) >= 0) {
                        var data = {
                            team: team,
                            role: team.members[x].role,
                            status: true
                        };
                        resolve(data);
                    } else {
                        var data = {
                            team: team,
                            status: false
                        };
                        resolve(data);
                    }
                } else {
                    var data = {
                        status: false
                    };
                    resolve(data);
                }
            })
            .catch(function(err) {
                reject(err);
            });
    });
};

app.get('/m-det/:tId', function(req, res) {
    if (req.query.authKey && req.params.tId && req.query.serverId) {
        User.findOne({
                authKey: req.query.authKey
            })
            .then(function(user) {
                if (user) {
                    checkUserInTeam(user._id, req.params.tId)
                        .then(function(data) {
                            if (data.status) {
                                var team = data.team;
                                require('../controllers/tserver/m-det')(req, res, uniR, formatBytes, moment, uniR, user, team);
                            } else {
                                uniR(res, false, 'Not authorized !!')
                            }
                        })
                        .catch(function(err) {
                            uniR(res, false, 'Error when querying');
                        });
                } else {
                    uniR(res, false, 'Account not found !!');
                }
            })
            .catch(function(err) {
                uniR(res, false, 'Error when querying');
            });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});

app.get('/activity/:tId', function(req, res) {
    if (req.query.authKey && req.params.tId && req.query.serverId) {
        User.findOne({
                authKey: req.query.authKey
            })
            .then(function(user) {
                if (user) {
                    checkUserInTeam(user._id, req.params.tId)
                        .then(function(data) {
                            if (data.status) {
                                require('../controllers/serverActivity')(req, res, uniR, data.team.added, 2);
                            } else {
                                uniR(res, false, 'Not authorized !!')
                            }
                        })
                        .catch(function(err) {
                            uniR(res, false, 'Error when querying');
                        });
                } else {
                    uniR(res, false, 'Account not found !!');
                }
            })
            .catch(function(err) {
                uniR(res, false, 'Error when querying');
            });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});

app.get('/monitorActivity/:tId', function(req, res) {
    if (req.query.authKey && req.params.tId && req.query.serverId) {
        User.findOne({
                authKey: req.query.authKey
            })
            .then(function(user) {
                if (user) {
                    checkUserInTeam(user._id, req.params.tId)
                        .then(function(data) {
                            if (data.status) {
                                require('../controllers/serverMonitorActivity')(req, res, uniR, data.team.added);
                            } else {
                                uniR(res, false, 'Not authorized !!')
                            }
                        })
                        .catch(function(err) {
                            uniR(res, false, 'Error when querying');
                        });
                } else {
                    uniR(res, false, 'Account not found !!');
                }
            })
            .catch(function(err) {
                uniR(res, false, 'Error when querying');
            });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});

app.post('/m-add/:tId', function(req, res) {
    if (req.body.authKey && req.params.tId && req.body.ip && req.body.uname && (req.body.password || req.body.file) && req.body.name && req.body.port && req.body.authType) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    checkUserInTeam(user._id, req.params.tId)
                        .then(function(data) {
                            if (data.status) {
                                if (data.role == 1) {
                                    var team = data.team;
                                    require('../controllers/tserver/m-add')(req, res, fs, ssh, requestIp, uniR, user, team);
                                } else {
                                    uniR(res, false, "You don't have enough permissions !!")
                                }
                            } else {
                                uniR(res, false, 'Not authorized !!')
                            }
                        })
                        .catch(function(err) {
                            uniR(res, false, 'Error when querying');
                        });
                } else {
                    uniR(res, false, 'Account not found !!');
                }
            })
            .catch(function(err) {
                uniR(res, false, 'Error when querying');
            });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});

app.post('/m-remove/:tId', function(req, res) {
    if (req.body.authKey && req.params.tId && req.body.serverId) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    checkUserInTeam(user._id, req.params.tId)
                        .then(function(data) {
                            if (data.status) {
                                if (data.role == 1) {
                                    var team = data.team;
                                    team.added.id(req.body.serverId).remove();
                                    team.logs.push({
                                        ip: requestIp.getClientIp(req),
                                        user: user.email,
                                        msg: 'Removed a server'
                                    });
                                    team.save();
                                    uniR(res, true, 'Server removed successfully !!');
                                } else {
                                    uniR(res, false, "You don't have enough permissions !!")
                                }
                            } else {
                                uniR(res, false, 'Not authorized !!')
                            }
                        })
                        .catch(function(err) {
                            uniR(res, false, 'Error when querying');
                        });
                } else {
                    uniR(res, false, 'Account not found !!');
                }
            })
            .catch(function(err) {
                uniR(res, false, 'Error when querying');
            });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});

app.post('/exec/:tId', function(req, res) {
    if (req.body.authKey && req.params.tId && req.body.serverId && (req.body.cmd == 1 || (req.body.cmd == 2 && req.body.hname) || req.body.cmd == 3)) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    checkUserInTeam(user._id, req.params.tId)
                        .then(function(data) {
                            if (data.status) {
                                var team = data.team;
                                require('../controllers/tserver/exec')(req, res, ssh, requestIp, uniR, user, team);
                            } else {
                                uniR(res, false, 'Not authorized !!')
                            }
                        })
                        .catch(function(err) {
                            uniR(res, false, 'Error when querying');
                        });
                } else {
                    uniR(res, false, 'Account not found !!');
                }
            })
            .catch(function(err) {
                uniR(res, false, 'Error when querying');
            });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});

app.post('/stack/:tId', function(req, res) {
    if (req.body.authKey && req.params.tId && req.body.serverId && (req.body.stack == 1 || req.body.stack == 2 || req.body.stack == 3 || req.body.stack == 4)) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    checkUserInTeam(user._id, req.params.tId)
                        .then(function(data) {
                            if (data.status) {
                                var team = data.team;
                                require('../controllers/tserver/stack')(req, res, ssh, uniR, user, team);
                            } else {
                                uniR(res, false, 'Not authorized !!')
                            }
                        })
                        .catch(function(err) {
                            console.log(err)
                            uniR(res, false, 'Error when querying');
                        });
                } else {
                    uniR(res, false, 'Account not found !!');
                }
            })
            .catch(function(err) {
                uniR(res, false, 'Error when querying');
            });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});

app.post('/m-name/:tId', function(req, res) {
    if (req.body.authKey && req.params.tId && req.body.serverId && req.body.name) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    checkUserInTeam(user._id, req.params.tId)
                        .then(function(data) {
                            if (data.status) {
                                var team = data.team;
                                if ((x = team.added.findIndex(x => x._id == req.body.serverId)) >= 0) {
                                    team.added[x].name = req.body.name;
                                    team.added[x].logs.push({
                                        ip: requestIp.getClientIp(req),
                                        msg: 'Changed server name to ' + req.body.name,
                                        user: user.email
                                    });
                                    team.save();
                                    uniR(res, true, 'Server name changed successfully !!');
                                } else {
                                    uniR(res, false, 'Server not found !!');
                                }
                            } else {
                                uniR(res, false, 'Not authorized !!')
                            }
                        })
                        .catch(function(err) {
                            uniR(res, false, 'Error when querying');
                        });
                } else {
                    uniR(res, false, 'Account not found !!');
                }
            })
            .catch(function(err) {
                uniR(res, false, 'Error when querying');
            });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});

app.post('/enableAlert/:tId', function(req, res) {
    if (req.body.authKey && req.params.tId && req.body.serverId && req.body.type && req.body.interval && req.body.val) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    checkUserInTeam(user._id, req.params.tId)
                        .then(function(data) {
                            if (data.status) {
                                var team = data.team;
                                require('../controllers/tserver/enableAlert')(req, res, requestIp, uniR, user, team);
                            } else {
                                uniR(res, false, 'Not authorized !!')
                            }
                        })
                        .catch(function(err) {
                            uniR(res, false, 'Error when querying');
                        });
                } else {
                    uniR(res, false, 'Account not found !!');
                }
            })
            .catch(function(err) {
                uniR(res, false, 'Error when querying');
            });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});

app.post('/disableAlert/:tId', function(req, res) {
    if (req.body.authKey && req.params.tId && req.body.serverId && req.body.type) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    checkUserInTeam(user._id, req.params.tId)
                        .then(function(data) {
                            if (data.status) {
                                var team = data.team;
                                require('../controllers/tserver/disableAlert')(req, res, requestIp, uniR, user, team);
                            } else {
                                uniR(res, false, 'Not authorized !!')
                            }
                        })
                        .catch(function(err) {
                            console.log(err)
                            uniR(res, false, 'Error when querying');
                        });
                } else {
                    uniR(res, false, 'Account not found !!');
                }
            })
            .catch(function(err) {
                uniR(res, false, 'Error when querying');
            });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});

app.post('/addCron/:tId', function(req, res) {
    if (req.body.authKey && req.params.tId && req.body.serverId && req.body.cmd && req.body.exp) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    checkUserInTeam(user._id, req.params.tId)
                        .then(function(data) {
                            if (data.status) {
                                var team = data.team;
                                require('../controllers/tserver/addCron')(req, res, ssh, requestIp, uniR, user, team);
                            } else {
                                uniR(res, false, 'Not authorized !!')
                            }
                        })
                        .catch(function(err) {
                            uniR(res, false, 'Error when querying');
                        });
                } else {
                    uniR(res, false, 'Account not found !!');
                }
            })
            .catch(function(err) {
                uniR(res, false, 'Error when querying');
            });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});

app.post('/delCron/:tId', function(req, res) {
    if (req.body.authKey && req.params.tId && req.body.serverId && req.body.cronId) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    checkUserInTeam(user._id, req.params.tId)
                        .then(function(data) {
                            if (data.status) {
                                var team = data.team;
                                require('../controllers/tserver/delCron')(req, res, ssh, requestIp, uniR, user, team);
                            } else {
                                uniR(res, false, 'Not authorized !!')
                            }
                        })
                        .catch(function(err) {
                            console.log(err)
                            uniR(res, false, 'Error when querying');
                        });
                } else {
                    uniR(res, false, 'Account not found !!');
                }
            })
            .catch(function(err) {
                uniR(res, false, 'Error when querying');
            });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});

app.post('/addStartupScript/:tId', function(req, res) {
    if (req.body.authKey && req.params.tId && req.body.serverId && req.body.cmd) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    checkUserInTeam(user._id, req.params.tId)
                        .then(function(data) {
                            if (data.status) {
                                var team = data.team;
                                require('../controllers/tserver/addStartupScript')(req, res, ssh, requestIp, uniR, user, team);
                            } else {
                                uniR(res, false, 'Not authorized !!')
                            }
                        })
                        .catch(function(err) {
                            uniR(res, false, 'Error when querying');
                        });
                } else {
                    uniR(res, false, 'Account not found !!');
                }
            })
            .catch(function(err) {
                uniR(res, false, 'Error when querying');
            });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});

app.post('/delStartupScript/:tId', function(req, res) {
    if (req.body.authKey && req.params.tId && req.body.serverId && req.body.startupScriptId) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    checkUserInTeam(user._id, req.params.tId)
                        .then(function(data) {
                            if (data.status) {
                                var team = data.team;
                                require('../controllers/tserver/delStartupScript')(req, res, ssh, requestIp, uniR, user, team);
                            } else {
                                uniR(res, false, 'Not authorized !!')
                            }
                        })
                        .catch(function(err) {
                            console.log(err)
                            uniR(res, false, 'Error when querying');
                        });
                } else {
                    uniR(res, false, 'Account not found !!');
                }
            })
            .catch(function(err) {
                uniR(res, false, 'Error when querying');
            });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});

app.post('/metrics/:teamId/:serverId', function(req, res) {
    if (req.params.serverId && req.params.teamId && req.body.m_t) {
        Team.findById(req.params.teamId)
            .then(function(team) {
                if (team) {
                    require('../controllers/tserver/metrics')(req, res, uniR, team);
                } else {
                    uniR(res, false, 'Account not found !!');
                }
            })
            .catch(function(err) {
                uniR(res, false, 'Error when querying');
            });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});
app.get('/embed', function(req, res) {
    if (req.query.serverId) {
        Team.findOne({
                'added._id': req.query.serverId
            })
            .then(function(team) {
                if (team) {
                    require('../controllers/tserver/embed')(req, res, moment, team);
                } else {
                    uniR(res, false, 'Account not found !!');
                }
            })
            .catch(function(err) {
                console.log(err)
                uniR(res, false, 'Error when querying');
            });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});

app.post('/uploadPrivateKey', function(req, res) {
    require('../controllers/uploadPrivateKey')(req, res, uniR, multer, hat);
});


module.exports = app;

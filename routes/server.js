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


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


//Responder
var uniR = require('../controllers/uniR');

//Bytes to Readable
var formatBytes = require('../controllers/formatBytes');

//Check uptime
// require('../controllers/server/checkServerUptime')();

app.get('/m-det', function(req, res) {
    if (req.query.authKey && req.query.serverId) {
        User.findOne({
                authKey: req.query.authKey
            })
            .then(function(user) {
                if (user) {
                    require('../controllers/server/m-det')(req, res, formatBytes, moment, uniR, user);
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

app.get('/activity', function(req, res) {
    if (req.query.authKey && req.query.serverId) {
        User.findOne({
                authKey: req.query.authKey
            })
            .then(function(user) {
                if (user) {
                    require('../controllers/serverActivity')(req, res, uniR, user.added, 1);
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

app.get('/monitorActivity', function(req, res) {
    if (req.query.authKey && req.query.serverId) {
        User.findOne({
                authKey: req.query.authKey
            })
            .then(function(user) {
                if (user) {
                    require('../controllers/serverMonitorActivity')(req, res, uniR, user.added);
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

app.post('/m-add', function(req, res) {
    if (req.body.authKey && req.body.ip && req.body.uname && (req.body.password || req.body.file) && req.body.name && req.body.port && req.body.authType) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    require('../controllers/server/m-add')(req, res, fs, ssh, requestIp, uniR, user);
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

app.post('/m-remove', function(req, res) {
    if (req.body.authKey && req.body.serverId) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    user.added.id(req.body.serverId).remove();
                    user.stats.added--;
                    user.logs.push({
                        ip: requestIp.getClientIp(req),
                        msg: 'Removed a server'
                    });
                    user.save();
                    uniR(res, true, 'Server removed successfully !!');
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

app.post('/exec', function(req, res) {
    if (req.body.authKey && req.body.serverId && (req.body.cmd == 1 || (req.body.cmd == 2 && req.body.hname) || req.body.cmd == 3)) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    require('../controllers/server/exec')(req, res, ssh, uniR, user);
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

app.post('/stack', function(req, res) {
    if (req.body.authKey && req.body.serverId && (req.body.stack == 1 || req.body.stack == 2 || req.body.stack == 3 || req.body.stack == 4 || req.body.stack == 5)) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    require('../controllers/server/stack')(req, res, ssh, uniR, user);
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

app.post('/m-name', function(req, res) {
    if (req.body.authKey && req.body.serverId && req.body.name) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    for (i = 0; i < user.added.length; i++)
                        if (user.added[i]._id == req.body.serverId) {
                            user.added[i].name = req.body.name;
                            user.added[i].logs.push({
                                msg: 'Changed server name to ' + req.body.name
                            });
                            user.save();
                        }
                    uniR(res, true, 'Server name changed successfully !!');
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

app.post('/enableAlert', function(req, res) {
    if (req.body.authKey && req.body.serverId && req.body.type && req.body.interval && req.body.val) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    require('../controllers/server/enableAlert')(req, res, uniR, user);
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

app.post('/disableAlert', function(req, res) {
    if (req.body.authKey && req.body.serverId && req.body.type) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    require('../controllers/server/disableAlert')(req, res, uniR, user);
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

app.post('/addCron', function(req, res) {
    if (req.body.authKey && req.body.serverId && req.body.cmd && req.body.exp) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    require('../controllers/server/addCron')(req, res, ssh, uniR, user);
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

app.post('/delCron', function(req, res) {
    if (req.body.authKey && req.body.serverId && req.body.cronId) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    require('../controllers/server/delCron')(req, res, ssh, uniR, user);
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

app.post('/addStartupScript', function(req, res) {
    if (req.body.authKey && req.body.serverId && req.body.cmd) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    require('../controllers/server/addStartupScript')(req, res, ssh, uniR, user);
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

app.post('/delStartupScript', function(req, res) {
    if (req.body.authKey && req.body.serverId && req.body.startupScriptId) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    require('../controllers/server/delStartupScript')(req, res, ssh, uniR, user);
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

app.post('/metrics/:userId/:serverId', function(req, res) {
    if (req.params.serverId && req.params.userId && req.body.m_t) {
        User.findById(req.params.userId)
            .then(function(user) {
                if (user) {
                    require('../controllers/server/metrics')(req, res, uniR, user);
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
        User.findOne({
                'added._id': req.query.serverId
            })
            .then(function(user) {
                if (user) {
                    require('../controllers/server/embed')(req, res, moment, user);
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

app.post('/uploadPrivateKey', function(req, res) {
    require('../controllers/uploadPrivateKey')(req, res, uniR, multer, hat);
});


module.exports = app;

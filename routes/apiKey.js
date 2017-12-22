var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var hat = require('hat');
var rack = hat.rack();
var User = require('../models/user');
var Team = require('../models/team');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


//Responder
var uniR = require('../controllers/uniR');

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

app.get('/', function(req, res) {
    if (req.query.authKey) {
        User.findOne({
                authKey: req.query.authKey
            })
            .then(function(user) {
                if (user) {
                    res.json({
                        status: true,
                        data: user.apis
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

app.get('/:tId', function(req, res) {
    if (req.query.authKey && req.params.tId) {
        User.findOne({
                authKey: req.query.authKey
            })
            .then(function(user) {
                if (user) {
                    checkUserInTeam(user._id, req.params.tId)
                        .then(function(data) {
                            if (data.status) {
                                res.json({
                                    status: true,
                                    data: data.team.apis
                                })
                            } else {
                                uniR(res, false, 'Not authorized !!')
                            }
                        })
                        .catch(function(err) {
                            console.log(err)
                            uniR(res, false, 'Error when querying')
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

app.post('/create', function(req, res) {
    if (req.body.authKey && req.body.name) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    user.apis.push({
                        name: req.body.name,
                        key: rack()
                    });
                    user.save();
                    uniR(res, true, 'API Key Created !!');
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

app.post('/create/:tId', function(req, res) {
    if (req.body.authKey && req.body.name && req.params.tId) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    checkUserInTeam(user._id, req.params.tId)
                        .then(function(data) {
                            if (data.status) {
                                var team = data.team;
                                team.apis.push({
                                    name: req.body.name,
                                    key: rack()
                                });
                                team.save();
                                uniR(res, true, 'API Key Created !!');
                            } else {
                                uniR(res, false, 'Not authorized !!')
                            }
                        })
                        .catch(function(err) {
                            console.log(err)
                            uniR(res, false, 'Error when querying')
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

app.post('/delete', function(req, res) {
    if (req.body.authKey && req.body.apiId) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    user.apis.id(req.body.apiId).remove();
                    user.save();
                    uniR(res, true, 'API Key Deleted !!');
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

app.post('/delete/:tId', function(req, res) {
    if (req.body.authKey && req.body.apiId && req.params.tId) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    checkUserInTeam(user._id, req.params.tId)
                        .then(function(data) {
                            if (data.status) {
                                var team = data.team;
                                team.apis.id(req.body.apiId).remove();
                                team.save();
                                uniR(res, true, 'API Key Deleted !!');
                            } else {
                                uniR(res, false, 'Not authorized !!')
                            }
                        })
                        .catch(function(err) {
                            console.log(err)
                            uniR(res, false, 'Error when querying')
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


module.exports = app;

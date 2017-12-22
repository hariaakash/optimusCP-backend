var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var hat = require('hat');
var sg = require('sendgrid')('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');
var request = require('request');
var requestIp = require('request-ip');
var User = require('../models/user');
var Team = require('../models/team');
var userUrl = 'http://localhost/a/#!/';


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

// Remove team
function removeTeam(team) {
    return new Promise(function(resolve, reject) {
        // console.log(team)
        for (i = 0; i < team.members.length; i++) {
            User.findById(team.members[i]._id)
                .then(function(user) {
                    if (user) {
                        user.teams = user.teams.filter(function(x) {
                            return x._id != team._id;
                        });
                        user.save();
                    }
                })
                .catch(function(err) {});
        }
        team.remove();
        resolve(true);
    });
}

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
                                var role = data.role;
                                data = data.team.toJSON();
                                data.role = role;
                                var logs = data.logs.reverse()
                                for (i = 0; i < logs.length; i++)
                                    logs[i].no = i;
                                data.logs = logs;
                                var added = [];
                                for (i = 0; i < data.added.length; i++)
                                    added.push({
                                        _id: data.added[i]._id,
                                        name: data.added[i].name,
                                        ip: data.added[i].ip,
                                        os: data.added[i].info.os,
                                        monitorLogs: data.added[i].monitorLogs[data.added[i].monitorLogs.length - 1]
                                    });
                                data.added = added;
                                res.json({
                                    status: true,
                                    data: data
                                });
                            } else {
                                uniR(res, false, 'Not authorized !!')
                            }
                        })
                        .catch(function(err) {
                            console.log(err)
                            uniR(res, false, 'Error when querying')
                        });
                } else {
                    uniR(res, false, 'Account not found !!')
                }
            })
            .catch(function(err) {
                uniR(res, false, 'Error when querying');
            });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});

//Create team
app.post('/create', function(req, res) {
    if (req.body.authKey && req.body.tName) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    var team = new Team();
                    team.name = req.body.tName;
                    team.members.push({
                        _id: user._id,
                        email: user.email,
                        role: 1
                    });
                    team.logs.push({
                        ip: requestIp.getClientIp(req),
                        user: user.email,
                        msg: 'Team created !!'
                    });
                    team.save()
                        .then(function(team) {
                            user.teams.push({
                                _id: team._id,
                                name: team.name,
                                role: 1
                            });
                            user.logs.push({
                                ip: requestIp.getClientIp(req),
                                msg: 'Team created: ' + team.name
                            });
                            user.save();
                            uniR(res, true, 'Team ""' + team.name + '" created')
                        });
                } else {
                    uniR(res, false, 'Account not found !!')
                }
            })
            .catch(function(err) {
                uniR(res, false, 'Error when querying');
            });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});

// Add a new member to the team
app.post('/addMember/:tId', function(req, res) {
    if (req.body.authKey && req.params.tId && req.body.email && req.body.role) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    User.findOne({
                            email: req.body.email
                        })
                        .then(function(newUser) {
                            if (newUser) {
                                checkUserInTeam(newUser._id, req.params.tId)
                                    .then(function(data) {
                                        console.log(data)
                                        if (!data.status) {
                                            var team = data.team;
                                            newUser.teams.push({
                                                _id: team._id,
                                                name: team.name,
                                                role: req.body.role
                                            });
                                            newUser.logs.push({
                                                ip: requestIp.getClientIp(req),
                                                msg: 'You are added to the team ' + team.name + ' by ' + user.email
                                            });
                                            team.logs.push({
                                                ip: requestIp.getClientIp(req),
                                                user: user.email,
                                                msg: newUser.email + ' was added.'
                                            });
                                            team.members.push({
                                                _id: newUser._id,
                                                email: newUser.email,
                                                role: req.body.role
                                            });
                                            team.save();
                                            newUser.save();
                                            uniR(res, true, 'Member added to the team !!')
                                        } else {
                                            uniR(res, false, 'User is already part of the team !!')
                                        }
                                    })
                            } else {
                                uniR(res, false, 'User is not registered with OptimusCP !!')
                            }
                        })
                        .catch(function(err) {
                            console.log(err)
                            uniR(res, false, 'Error when querying')
                        });
                } else {
                    uniR(res, false, 'Account not found !!')
                }
            })
            .catch(function(err) {
                uniR(res, false, 'Error when querying');
            });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});

// Remove a member from the team
app.post('/delMember/:tId', function(req, res) {
    if (req.body.authKey && req.params.tId && req.body.uId) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    checkUserInTeam(user._id, req.params.tId)
                        .then(function(data) {
                            if (data.status) {
                                var team = data.team;
                                if (data.role == 1) {
                                    User.findOne({
                                            _id: req.body.uId
                                        })
                                        .then(function(delUser) {
                                            if (delUser) {
                                                delUser.teams = delUser.teams.filter(function(x) {
                                                    return x._id != req.params.tId;
                                                });
                                                delUser.logs.push({
                                                    ip: requestIp.getClientIp(req),
                                                    msg: 'You are removed from the team ' + team.name + ' by ' + user.email
                                                });
                                                Team.findById(req.params.tId)
                                                    .then(function(team) {
                                                        if (team) {
                                                            team.members = team.members.filter(function(x) {
                                                                return x._id != req.body.uId;
                                                            });
                                                            team.logs.push({
                                                                ip: requestIp.getClientIp(req),
                                                                user: user.email,
                                                                msg: delUser.email + ' was removed'
                                                            });
                                                            delUser.save();
                                                            team.save();
                                                            uniR(res, true, 'Team member removed !!');
                                                        } else {
                                                            uniR(res, false, 'Team not found !!');
                                                        }
                                                    })
                                                    .catch(function(err) {
                                                        uniR(res, false, 'Error when querying')
                                                    });
                                            } else {
                                                uniR(res, false, 'User not found !!')
                                            }
                                        })
                                        .catch(function(err) {
                                            uniR(res, false, 'Error when querying')
                                        });
                                } else {
                                    uniR(res, false, "You don't have enough permissions !!")
                                }
                            } else {
                                uniR(res, false, 'Not authorized !!')
                            }
                        })
                        .catch(function(err) {
                            uniR(res, false, 'Error when querying')
                        });
                } else {
                    uniR(res, false, 'Account not found !!')
                }
            })
            .catch(function(err) {
                uniR(res, false, 'Error when querying');
            });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});

// Remove the team completely
app.post('/delete/:tId', function(req, res) {
    if (req.body.authKey && req.params.tId) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    checkUserInTeam(user._id, req.params.tId)
                        .then(function(data) {
                            if (data.status) {
                                if (data.role == 1) {
                                    removeTeam(data.team)
                                        .then(function(status) {
                                            if (status) {
                                                uniR(res, true, 'Team removed successfully !!')
                                            } else {
                                                uniR(res, false, 'Error in removing the team !')
                                            }
                                        })
                                        .catch(function(err) {
                                            uniR(res, false, 'Error when querying');
                                        });
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
                    uniR(res, false, 'Account not found !!')
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

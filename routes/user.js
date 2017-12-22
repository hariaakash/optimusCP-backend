var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var hat = require('hat');
var bcrypt = require('bcryptjs');
var cron = require('node-cron');
var sg = require('sendgrid')('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');
var request = require('request');
var requestIp = require('request-ip');
var crypto = require('crypto');
var User = require('../models/user');
var Team = require('../models/team');
var userUrl = 'https://optimuscp.io/dashboard/#!/';


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


//Authentication key Changer
cron.schedule('0 */8 * * *', function() {
    User.find({})
        .then(function(users) {
            if (users[0]) {
                for (i = 0; i < users.length; i++) {
                    users[i].authKey = hat();
                    users[i].save();
                }
            }
            console.log('Recreated');
        });
});

//Responder
var uniR = require('../controllers/uniR');

//MD5 HASH Calculator for Gravatar
function md5(string) {
    return crypto.createHash('md5').update(string).digest('hex');
}

app.get('/', function(req, res) {
    if (req.query.authKey) {
        User.findOne({
                authKey: req.query.authKey
            })
            .then(function(user) {
                if (user) {
                    var added = [];
                    if (user.added)
                        for (i = 0; i < user.added.length; i++)
                            added.push({
                                _id: user.added[i]._id,
                                name: user.added[i].name,
                                ip: user.added[i].ip,
                                os: user.added[i].info.os,
                                monitorLogs: user.added[i].monitorLogs[user.added[i].monitorLogs.length - 1]
                            });
                    res.json({
                        status: true,
                        data: {
                            email: user.email,
                            info: user.info,
                            stats: user.stats,
                            teams: user.teams,
                            added: added,
                            block: user.conf.block
                        }
                    });
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

app.post('/register', function(req, res) {
    if (req.body.email && req.body.password) {
        bcrypt.hash(req.body.password, 10, function(err, hash) {
            var user = new User();
            user.email = req.body.email.toLowerCase();
            user.password = hash;
            user.conf.verified = hat();
            user.authKey = hat();
            user.info = {
                img: md5(user.email)
            };
            user.logs.push({
                ip: requestIp.getClientIp(req),
                msg: 'Registered account'
            });
            user.save()
                .then(function(user) {
                    uniR(res, true, 'Successfully Registered, Verify Email by checking your inbox to continue....');
                    var helper = require('sendgrid').mail;
                    var from = new helper.Email('support@optimuscp.io');
                    var to = new helper.Email(user.email);
                    var subject = 'Welcome to OptimusCP ! Confirm Your Email';
                    var body = new helper.Content('text/html', 'Welcome to OptimusCP');
                    var mail = new helper.Mail(from, subject, to, body);
                    mail.personalizations[0].addSubstitution(new helper.Substitution('-email-', user.email));
                    mail.personalizations[0].addSubstitution(new helper.Substitution('-url-', userUrl + 'verifyEmail?email=' + encodeURIComponent(req.body.email) + '&key=' + user.conf.verified));
                    mail.personalizations[0].addSubstitution(new helper.Substitution('-body-', 'Welcome to OptimusCP'));
                    mail.setTemplateId('c9bd7737-04cd-4a52-ae61-5ce1fbf35208');
                    var request = sg.emptyRequest({
                        method: 'POST',
                        path: '/v3/mail/send',
                        body: mail.toJSON(),
                    });
                    sg.API(request);
                })
                .catch(function(err) {
                    console.log(err);
                    uniR(res, false, 'Chosen email is already registered !!');
                });
        });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});

app.post('/login', function(req, res) {
    if (req.body.email && req.body.password) {
        User.findOne({
                email: req.body.email.toLowerCase()
            })
            .then(function(user) {
                if (user) {
                    if (user.conf.verified == 'true') {
                        bcrypt.compare(req.body.password, user.password, function(err, resp) {
                            if (resp == true) {
                                user.logs.push({
                                    ip: requestIp.getClientIp(req),
                                    msg: 'Logged in'
                                });
                                user.save();
                                res.json({
                                    status: true,
                                    msg: 'Successfully authenticated !!',
                                    authKey: user.authKey
                                });
                            } else {
                                uniR(res, false, 'Entered password is wrong !!');
                            }
                        });
                    } else {
                        uniR(res, false, 'Verify your account to login !!');
                    }
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

app.post('/verifyEmail', function(req, res) {
    if (req.body.key && req.body.email) {
        User.findOne({
                email: req.body.email,
                'conf.verified': req.body.key
            })
            .then(function(user) {
                if (user) {
                    user.conf.verified = 'true';
                    user.logs.push({
                        ip: requestIp.getClientIp(req),
                        msg: 'Verified Account'
                    });
                    user.save();
                    var helper = require('sendgrid').mail;
                    var from = new helper.Email('support@optimuscp.io');
                    var to = new helper.Email(user.email);
                    var subject = 'Your OptimusCP account has been provisioned!';
                    var body = new helper.Content('text/html', 'Welcome to OptimusCP');
                    var mail = new helper.Mail(from, subject, to, body);
                    mail.personalizations[0].addSubstitution(new helper.Substitution('-email-', user.email));
                    mail.personalizations[0].addSubstitution(new helper.Substitution('-url-', userUrl));
                    mail.personalizations[0].addSubstitution(new helper.Substitution('-body-', 'Account activated !!'));
                    mail.setTemplateId('8d119af3-233a-414a-83d4-2296bc8f411f');
                    var request = sg.emptyRequest({
                        method: 'POST',
                        path: '/v3/mail/send',
                        body: mail.toJSON(),
                    });
                    sg.API(request);
                    uniR(res, true, 'Successfully verified, login to continue !!');
                } else {
                    uniR(res, false, 'Account already verfied / Verification key expired !!');
                }
            })
            .catch(function(err) {
                uniR(res, false, 'Error when querying');
            });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});

app.post('/sendEmailVerification', function(req, res) {
    if (req.body.email) {
        User.findOne({
                email: req.body.email
            })
            .then(function(user) {
                if (user) {
                    if (user.conf.verified != 'true') {
                        user.conf.verified = hat();
                        user.save();
                        var helper = require('sendgrid').mail;
                        var from = new helper.Email('support@optimuscp.io');
                        var to = new helper.Email(user.email);
                        var subject = 'Welcome to OptimusCP ! Confirm Your Email';
                        var body = new helper.Content('text/html', 'Welcome to OptimusCP');
                        var mail = new helper.Mail(from, subject, to, body);
                        mail.personalizations[0].addSubstitution(new helper.Substitution('-email-', user.email));
                        mail.personalizations[0].addSubstitution(new helper.Substitution('-url-', userUrl + 'verifyEmail?email=' + encodeURIComponent(req.body.email) + '&key=' + user.conf.verified));
                        mail.personalizations[0].addSubstitution(new helper.Substitution('-body-', 'Welcome to OptimusCP'));
                        mail.setTemplateId('c9bd7737-04cd-4a52-ae61-5ce1fbf35208');
                        var request = sg.emptyRequest({
                            method: 'POST',
                            path: '/v3/mail/send',
                            body: mail.toJSON(),
                        });
                        sg.API(request);
                        uniR(res, true, 'Verification email sent again !!');
                    } else {
                        uniR(res, false, 'Account already verified !!');
                    }
                } else {
                    uniR(res, false, 'Account not found / already verified !!');
                }
            })
            .catch(function(err) {
                uniR(res, false, 'Error when querying');
            });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});

app.post('/forgotPassword', function(req, res) {
    if (req.body.email) {
        User.findOne({
                email: req.body.email
            })
            .then(function(user) {
                if (user) {
                    user.conf.pVerify = hat();
                    user.save();
                    var helper = require('sendgrid').mail;
                    var from = new helper.Email('support@optimuscp.io');
                    var to = new helper.Email(user.email);
                    var subject = 'Reset your password !!';
                    var body = new helper.Content('text/html', user.conf.pVerify);
                    var mail = new helper.Mail(from, subject, to, body);
                    mail.personalizations[0].addSubstitution(new helper.Substitution('-email-', req.body.email));
                    mail.personalizations[0].addSubstitution(new helper.Substitution('-url-', userUrl + 'changePassword?email=' + encodeURIComponent(req.body.email) + '&key=' + user.conf.pVerify));
                    mail.personalizations[0].addSubstitution(new helper.Substitution('-body-', 'Reset account password'));
                    mail.setTemplateId('7721a5f3-8c96-43df-8bba-eec7c4d90144');
                    var request = sg.emptyRequest({
                        method: 'POST',
                        path: '/v3/mail/send',
                        body: mail.toJSON(),
                    });
                    sg.API(request);
                    uniR(res, true, 'Password reset link, send to registered email !!');
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

app.post('/changePassword', function(req, res) {
    if (req.body.key && req.body.email && req.body.password) {
        User.findOne({
                email: req.body.email,
                'conf.pVerify': req.body.key
            })
            .then(function(user) {
                if (user) {
                    bcrypt.hash(req.body.password, 10, function(err, hash) {
                        user.password = hash;
                        user.logs.push({
                            ip: requestIp.getClientIp(req),
                            msg: 'Password Changed'
                        });
                        user.save();
                        user.conf.pVerify = 'true';
                        uniR(res, true, 'Password set successfully !!');
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

app.post('/changePasswordAccount', function(req, res) {
    if (req.body.authKey && req.body.oldPassword && req.body.newPassword) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    bcrypt.compare(req.body.oldPassword, user.password, function(err, resp) {
                        if (resp == true) {
                            bcrypt.hash(req.body.newPassword, 10, function(err, hash) {
                                user.password = hash;
                                user.logs.push({
                                    ip: requestIp.getClientIp(req),
                                    msg: 'Password Changed'
                                });
                                user.save();
                                uniR(res, true, 'Password set successfully !!');
                            });
                        } else {
                            uniR(res, false, 'Entered password is wrong !!');
                        }
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

app.post('/editProfile', function(req, res) {
    if (req.body.authKey && req.body.name && req.body.address && req.body.city && req.body.state && req.body.country) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    if (user.info.set == false) {
                        user.info = {
                            name: req.body.name,
                            address: req.body.address,
                            city: req.body.city,
                            state: req.body.state,
                            country: req.body.country,
                            set: true,
                            img: md5(user.email)
                        };
                        user.logs.push({
                            ip: requestIp.getClientIp(req),
                            msg: 'Profile Information Set'
                        });
                        user.save();
                        uniR(res, true, 'User profile information set !!')
                    } else {
                        uniR(res, false, 'Your information is already set !!')
                    }
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
    if (req.query.authKey) {
        User.findOne({
                authKey: req.query.authKey
            })
            .then(function(user) {
                if (user) {
                    var logs = [];
                    user.logs = user.logs.reverse()
                    for (i = 0; i < user.logs.length; i++)
                        logs.push({
                            no: i,
                            msg: user.logs[i].msg,
                            date: user.logs[i].date
                        })
                    res.json({
                        status: true,
                        data: logs
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

app.get('/tickets', function(req, res) {
    if (req.query.authKey) {
        User.findOne({
                authKey: req.query.authKey
            })
            .then(function(user) {
                if (user) {
                    var tickets = {
                        open: [],
                        closed: []
                    };
                    for (i = 0; i < user.tickets.length; i++) {
                        if (user.tickets[i].status == "open")
                            tickets.open.push(user.tickets[i]);
                        else
                            tickets.closed.push(user.tickets[i]);
                    }
                    res.json({
                        status: true,
                        data: tickets
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

app.get('/tickets/:tId', function(req, res) {
    if (req.query.authKey && req.params.tId) {
        User.findOne({
                authKey: req.query.authKey
            })
            .then(function(user) {
                if (user) {
                    for (i = 0; i < user.tickets.length; i++)
                        if (user.tickets[i]._id == req.params.tId)
                            res.json({
                                status: true,
                                data: user.tickets[i]
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

app.post('/tickets/create', function(req, res) {
    if (req.body.authKey && req.body.sub && req.body.msg) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    var conv = [{
                        msg: req.body.msg,
                        person: 0
                    }];
                    user.tickets.push({
                        sub: req.body.sub,
                        conv: conv
                    });
                    user.stats.tickets.open++;
                    user.logs.push({
                        ip: requestIp.getClientIp(req),
                        msg: 'Created ticket: ' + user.tickets[user.tickets.length - 1]._id
                    });
                    user.save();
                    uniR(res, true, 'Support ticket created successfully !!');
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

app.post('/tickets/msg', function(req, res) {
    if (req.body.authKey && req.body.tId && req.body.msg) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    for (i = 0; i < user.tickets.length; i++) {
                        if (user.tickets[i]._id == req.body.tId && user.tickets[i].status == "open") {
                            user.tickets[i].conv.push({
                                msg: req.body.msg
                            });
                            user.logs.push({
                                ip: requestIp.getClientIp(req),
                                msg: 'Replied to ticket: ' + user.tickets[i]._id
                            });
                            user.save();
                        }
                    }
                    uniR(res, true, 'Ticket updated successfully !!');
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

app.post('/tickets/close', function(req, res) {
    if (req.body.authKey && req.body.tId) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    for (i = 0; i < user.tickets.length; i++) {
                        if (user.tickets[i]._id == req.body.tId) {
                            user.tickets[i].conv.push({
                                msg: 'Ticked closed by me'
                            });
                            user.tickets[i].status = "closed";
                            user.stats.tickets.open--;
                            user.stats.tickets.closed++;
                            user.logs.push({
                                ip: requestIp.getClientIp(req),
                                msg: 'Closed ticket: ' + user.tickets[i]._id
                            });
                            user.save();
                        }
                    }
                    uniR(res, true, 'Support ticket closed !!');
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

app.post('/tickets/reopen', function(req, res) {
    if (req.body.authKey && req.body.tId) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    for (i = 0; i < user.tickets.length; i++) {
                        if (user.tickets[i]._id == req.body.tId) {
                            user.tickets[i].status = "open";
                            user.stats.tickets.open++;
                            user.stats.tickets.closed--;
                            user.logs.push({
                                ip: requestIp.getClientIp(req),
                                msg: 'Reopened ticket: ' + user.tickets[i]._id
                            });
                            user.save();
                        }
                    }
                    uniR(res, true, 'Support ticket reopened !!');
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

app.post('/team/create', function(req, res) {
    if (req.body.authKey && req.body.name) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    Team.findOne({
                            name: req.body.name
                        })
                        .then(function(checkTeam) {
                            if (checkTeam) {
                                var team = new Team();
                                team.admin = user.email;
                                user.logs.push({
                                    ip: requestIp.getClientIp(req),
                                    msg: 'Team created'
                                });
                                team.save();
                                user.logs.push({
                                    ip: requestIp.getClientIp(req),
                                    msg: 'Created team: ' + req.body.name
                                });
                                user.save();
                                uniR(res, true, 'Team created successfully !!')
                            } else {
                                uniR(res, false, 'Team name already chosen !!')
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

app.post('/payment', function(req, res) {
    if (req.body.authKey && req.body.email && req.body.amount) {
        var headers = {
            'X-Api-Key': '6cbe1d7f5c66201e59e6e1d0d8bd32b4',
            'X-Auth-Token': 'fb30cd538c9483393a9eb8e26287c25e'
        };
        var payload = {
            purpose: 'Server Credits',
            amount: req.body.amount,
            redirect_url: 'http://www.example.com/redirect/',
            email: req.body.email,
            allow_repeated_payments: false
        };
        request.post('https://test.instamojo.com/api/1.1/payment-requests/', {
            form: payload,
            headers: headers
        }, function(error, response, body) {
            if (!error && response.statusCode == 201) {
                res.json(JSON.parse(body));
            } else if (!body.success) {
                res.json('failed');
            } else {
                res.json('error');
                console.log(error);
            }
        });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});

app.get('/payment', function(req, res) {
    if (!req.query.authKey) {
        var headers = {
            'X-Api-Key': '6cbe1d7f5c66201e59e6e1d0d8bd32b4',
            'X-Auth-Token': 'fb30cd538c9483393a9eb8e26287c25e'
        };
        request.get('https://test.instamojo.com/api/1.1/payment-requests/', {
            headers: headers
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                res.json(JSON.parse(body));
            } else if (!body.success) {
                res.json('failed');
            } else {
                res.json('error');
                console.log(error);
            }
        });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});


module.exports = app;

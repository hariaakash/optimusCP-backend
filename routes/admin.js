var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var hat = require('hat');
var bcrypt = require('bcryptjs');
var sg = require('sendgrid')('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');
var request = require('request');
var cron = require('node-cron');
var requestIp = require('request-ip');
var User = require('../models/user');
var Admin = require('../models/admin');
var adminUrl = 'http://optimuscp.io/admin/';


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


// Creating Admin
bcrypt.hash('beingawesome', 10, function(err, hash) {
    var admin = new Admin();
    admin.email = 'smgdark@gmail.com';
    admin.password = hash;
    admin.adminKey = hat();
    admin.save()
        .then(function(user) {
            console.log('Admin created !!');
        })
        .catch(function(err) {
            console.log('Admin already exists !!');
        });
});


//Authentication key Changer
cron.schedule('0 */2 * * *', function() {
    Admin.find({})
        .then(function(admins) {
            if (admins[0]) {
                for (i = 0; i < admins.length; i++) {
                    admins[i].adminKey = hat();
                    admins[i].save();
                }
            }
            console.log('Recreated Admin');
        });
});


//Responder
var uniR = require('../controllers/uniR');


//Routes
app.get('/', function(req, res) {
    if (req.query.adminKey) {
        Admin.findOne({
                adminKey: req.query.adminKey
            })
            .then(function(admin) {
                if (admin) {
                    User.find()
                        .then(function(users) {
                            var user = [],
                                server = 0,
                                verified = 0,
                                tickets = 0;
                            for (i = 0; i < users.length; i++) {
                                server += users[i].stats.added;
                                tickets += users[i].stats.tickets.open;
                                if (users[i].conf.verified == 'true')
                                    verified += 1;
                                user.push({
                                    no: user.length + 1,
                                    id: users[i]._id,
                                    email: users[i].email,
                                    block: users[i].conf.block,
                                    verified: users[i].conf.verified,
                                    added: users[i].stats.added,
                                    tickets: users[i].stats.tickets.open
                                });
                            }
                            res.json({
                                status: true,
                                data: {
                                    servers: server,
                                    verified: verified,
                                    users: user,
                                    tickets: tickets,
                                    info: admin.info,
                                    email: admin.email,
                                    role: admin.role
                                }
                            });
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

// View Profile Activity
app.get('/activity', function(req, res) {
    if (req.query.adminKey) {
        Admin.findOne({
                adminKey: req.query.adminKey
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

// Admin Area
app.get('/view', function(req, res) {
    if (req.query.adminKey) {
        Admin.findOne({
                adminKey: req.query.adminKey
            })
            .then(function(admin) {
                if (admin) {
                    if (admin.role == 'admin') {
                        Admin.find()
                            .then(function(admins) {
                                var admin = [],
                                    support = [];
                                for (i = 0; i < admins.length; i++) {
                                    if (admins[i].role == 'admin')
                                        admin.push({
                                            id: admins[i]._id,
                                            email: admins[i].email,
                                            info: admins[i].info,
                                            logs: admins[i].logs
                                        });
                                    else
                                        support.push({
                                            id: admins[i]._id,
                                            email: admins[i].email,
                                            block: admins[i].block,
                                            info: admins[i].info,
                                            logs: admins[i].logs
                                        });
                                }
                                res.json({
                                    status: true,
                                    data: {
                                        admins: admin,
                                        supports: support
                                    }
                                });
                            })
                            .catch(function(err) {
                                uniR(res, false, 'Error when querying');
                            });
                    } else {
                        admin.logs.push({
                            ip: requestIp.getClientIp(req),
                            msg: 'Tried to sneak in to admin page using api !!'
                        });
                        admin.save();
                        uniR(res, false, 'You tried to sneak in, we got you covered !!')
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

// Login
app.post('/login', function(req, res) {
    if (req.body.email && req.body.password) {
        Admin.findOne({
                email: req.body.email
            })
            .then(function(admin) {
                if (admin) {
                    bcrypt.compare(req.body.password, admin.password, function(err, resp) {
                        if (admin.block == true) {
                            uniR(res, false, 'You are blocked from accessing the panel !!');
                        } else if (resp == true) {
                            admin.logs.push({
                                ip: requestIp.getClientIp(req),
                                msg: 'Logged in'
                            });
                            admin.save();
                            res.json({
                                status: true,
                                msg: 'Successfully authenticated !!',
                                adminKey: admin.adminKey
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


// Logout
app.get('/logout', function(req, res) {
    if (req.query.adminKey) {
        Admin.findOne({
                adminKey: req.query.adminKey
            })
            .then(function(admin) {
                if (admin) {
                    admin.adminKey = hat();
                    admin.logs.push({
                        ip: requestIp.getClientIp(req),
                        msg: 'Logged out'
                    });
                    admin.save();
                    uniR(res, true, 'Logged out !!');
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

// Change password from profile
app.post('/changePasswordAccount', function(req, res) {
    if (req.body.adminKey && req.body.oldPassword && req.body.newPassword) {
        Admin.findOne({
                adminKey: req.body.adminKey
            })
            .then(function(admin) {
                if (admin) {
                    bcrypt.compare(req.body.oldPassword, admin.password, function(err, resp) {
                        if (resp == true) {
                            bcrypt.hash(req.body.newPassword, 10, function(err, hash) {
                                admin.password = hash;
                                admin.logs.push({
                                    ip: requestIp.getClientIp(req),
                                    msg: 'Password Changed'
                                });
                                admin.save();
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

// Edit Profile
app.post('/editProfile', function(req, res) {
    if (req.body.adminKey && req.body.name && req.body.address && req.body.city && req.body.state && req.body.country) {
        Admin.findOne({
                adminKey: req.body.adminKey
            })
            .then(function(admin) {
                if (admin) {
                    admin.info = {
                        name: req.body.name,
                        address: req.body.address,
                        city: req.body.city,
                        state: req.body.state,
                        country: req.body.country,
                        set: true
                    };
                    admin.logs.push({
                        ip: requestIp.getClientIp(req),
                        msg: 'Profile Information Updated'
                    });
                    admin.save();
                    uniR(res, true, 'User profile information set !!')
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

// Add Staff
app.post('/addUser', function(req, res) {
    if (req.body.adminKey && req.body.email && req.body.role) {
        Admin.findOne({
                adminKey: req.body.adminKey
            })
            .then(function(mAdmin) {
                if (mAdmin && mAdmin.block == false) {
                    if (req.body.role == 'admin' || req.body.role == 'support') {
                        Admin.findOne({
                                email: req.body.email
                            })
                            .then(function(oldUser) {
                                if (!oldUser) {
                                    var password = (Math.random().toString(36) + '00000000000000000').slice(2, 8 + 2);
                                    bcrypt.hash(password, 10, function(err, hash) {
                                        var admin = new Admin();
                                        admin.email = req.body.email;
                                        admin.password = hash;
                                        admin.adminKey = hat();
                                        admin.role = req.body.role;
                                        admin.save()
                                            .then(function(user) {
                                                uniR(res, true, 'User Added successfully !!');
                                                var helper = require('sendgrid').mail;
                                                var from = new helper.Email('support@optimuscp.io');
                                                var to = new helper.Email(user.email);
                                                var subject = 'Welcome to OptimusCP !! Account Details';
                                                var body = new helper.Content('text/html', 'Welcome to OptimusCP');
                                                var mail = new helper.Mail(from, subject, to, body);
                                                mail.personalizations[0].addSubstitution(new helper.Substitution('-email-', admin.email));
                                                mail.personalizations[0].addSubstitution(new helper.Substitution('-role-', req.body.role));
                                                mail.personalizations[0].addSubstitution(new helper.Substitution('-password-', password));
                                                mail.personalizations[0].addSubstitution(new helper.Substitution('-body-', 'Welcome to OptimusCP'));
                                                mail.personalizations[0].addSubstitution(new helper.Substitution('-url-', adminUrl));
                                                mail.setTemplateId('5cd94dde-e81a-4159-8ac0-291bf3914506');
                                                var request = sg.emptyRequest({
                                                    method: 'POST',
                                                    path: '/v3/mail/send',
                                                    body: mail.toJSON(),
                                                });
                                                sg.API(request);
                                                mAdmin.logs.push({
                                                    ip: requestIp.getClientIp(req),
                                                    msg: 'Added new staff: ' + req.body.email + ' having role: ' + req.body.role
                                                });
                                                mAdmin.save();
                                            })
                                            .catch(function(err) {
                                                console.log(err);
                                                uniR(res, false, 'Chosen email is already registered !!');
                                            });
                                    });
                                } else {
                                    uniR(res, false, 'Staff already registered!!')
                                }
                            })
                            .catch(function(err) {
                                uniR(res, false, 'Error when querying');
                            });
                    } else {
                        uniR(res, false, 'Wrong user role !!')
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

// Block temporary access for staffs
app.post('/blockStaff', function(req, res) {
    if (req.body.adminKey && req.body.sId) {
        Admin.findOne({
                adminKey: req.body.adminKey
            })
            .then(function(admin) {
                if (admin && admin.role == 'admin') {
                    Admin.findById(req.body.sId)
                        .then(function(staff) {
                            if (staff && staff.role == 'support') {
                                if (staff.block == false) {
                                    staff.block = true;
                                    staff.adminKey = hat();
                                    staff.save();
                                    admin.logs.push({
                                        ip: requestIp.getClientIp(req),
                                        msg: 'Blocked staff: ' + staff.email
                                    });
                                    admin.save();
                                    uniR(res, true, 'Staff blocked !!')
                                } else {
                                    uniR(res, false, 'Staff already blocked !!')
                                }
                            } else {
                                uniR(res, false, 'User not found !!')
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

// Unblock the access
app.post('/unBlockStaff', function(req, res) {
    if (req.body.adminKey && req.body.sId) {
        Admin.findOne({
                adminKey: req.body.adminKey
            })
            .then(function(admin) {
                if (admin && admin.role == 'admin') {
                    Admin.findById(req.body.sId)
                        .then(function(staff) {
                            if (staff && staff.role == 'support') {
                                if (staff.block == true) {
                                    staff.block = false;
                                    staff.save();
                                    admin.logs.push({
                                        ip: requestIp.getClientIp(req),
                                        msg: 'UnBlocked staff: ' + staff.email
                                    });
                                    admin.save();
                                    uniR(res, true, 'Staff unblocked !!')
                                } else {
                                    uniR(res, false, 'Staff already unblocked !!')
                                }
                            } else {
                                uniR(res, false, 'User not found !!')
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

// Delete staff
app.post('/delStaff', function(req, res) {
    if (req.body.adminKey && req.body.sId) {
        Admin.findOne({
                adminKey: req.body.adminKey
            })
            .then(function(admin) {
                if (admin && admin.role == 'admin') {
                    Admin.findById(req.body.sId)
                        .then(function(staff) {
                            if (staff && staff.role == 'support') {
                                admin.logs.push({
                                    ip: requestIp.getClientIp(req),
                                    msg: 'Removed staff: ' + staff.email
                                });
                                admin.save();
                                staff.remove();
                                uniR(res, true, 'Staff Removed !!')
                            } else {
                                uniR(res, false, 'User not found !!')
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

// View User
app.post('/user/:uId', function(req, res) {
    if (req.body.adminKey && req.params.uId) {
        Admin.findOne({
                adminKey: req.body.adminKey
            })
            .then(function(admin) {
                if (admin) {
                    User.findById(req.params.uId)
                        .then(function(user) {
                            if (user) {
                                var added = [],
                                    tickets = {
                                        open: [],
                                        closed: []
                                    };
                                for (i = 0; i < user.tickets.length; i++) {
                                    if (user.tickets[i].status == "open")
                                        tickets.open.push(user.tickets[i]);
                                    else
                                        tickets.closed.push(user.tickets[i]);
                                }
                                for (i = 0; i < user.added.length; i++) {
                                    added.push({
                                        id: user.added[i]._id,
                                        ip: user.added[i].ip,
                                        port: user.added[i].port,
                                        name: user.added[i].name,
                                        os: user.added[i].info.os,
                                        crons: user.added[i].crons.length,
                                        ss: user.added[i].startupScripts.length
                                    });
                                }
                                res.json({
                                    status: true,
                                    data: {
                                        id: user._id,
                                        email: user.email,
                                        info: user.info,
                                        plan: user.conf.plan,
                                        stats: user.stats,
                                        tickets: tickets,
                                        apis: user.apis.length,
                                        added: added
                                    }
                                });
                            } else {
                                uniR(res, false, 'User not found !!')
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

// Block User
app.post('/blockUser', function(req, res) {
    if (req.body.adminKey && req.body.uId) {
        Admin.findOne({
                adminKey: req.body.adminKey
            })
            .then(function(admin) {
                if (admin) {
                    User.findById(req.body.uId)
                        .then(function(user) {
                            if (user) {
                                if (user.conf.block == false) {
                                    user.conf.block = true;
                                    user.authKey = hat();
                                    user.save();
                                    admin.logs.push({
                                        ip: requestIp.getClientIp(req),
                                        msg: 'Blocked user: ' + user.email
                                    });
                                    admin.save();
                                    uniR(res, true, 'User blocked !!')
                                } else {
                                    uniR(res, false, 'User already blocked !!')
                                }
                            } else {
                                uniR(res, false, 'User not found !!')
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

// Unblock user
app.post('/unBlockUser', function(req, res) {
    if (req.body.adminKey && req.body.uId) {
        Admin.findOne({
                adminKey: req.body.adminKey
            })
            .then(function(admin) {
                if (admin) {
                    User.findById(req.body.uId)
                        .then(function(user) {
                            if (user) {
                                if (user.conf.block == true) {
                                    user.conf.block = false;
                                    user.save();
                                    admin.logs.push({
                                        ip: requestIp.getClientIp(req),
                                        msg: 'UnBlocked user: ' + user.email
                                    });
                                    admin.save();
                                    uniR(res, true, 'User unblocked !!')
                                } else {
                                    uniR(res, false, 'Staff already unblocked !!')
                                }
                            } else {
                                uniR(res, false, 'User not found !!')
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

// view user tickets
app.get('/tickets/:tId', function(req, res) {
    if (req.query.adminKey && req.query.uId && req.params.tId) {
        Admin.findOne({
                adminKey: req.query.adminKey
            })
            .then(function(admin) {
                if (admin) {
                    User.findById(req.query.uId)
                        .then(function(user) {
                            if (user) {
                                for (i = 0; i < user.tickets.length; i++)
                                    if (user.tickets[i]._id == req.params.tId)
                                        res.json({
                                            status: true,
                                            data: user.tickets[i]
                                        });
                            } else {
                                uniR(res, false, 'User not found !!')
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

// create ticket for user
app.post('/tickets/create', function(req, res) {
    if (req.body.adminKey && req.body.uId && req.body.sub && req.body.msg) {
        Admin.findOne({
                adminKey: req.body.adminKey
            })
            .then(function(admin) {
                if (admin) {
                    User.findById(req.body.uId)
                        .then(function(user) {
                            if (user) {
                                var conv = [{
                                    msg: req.body.msg,
                                    person: 1
                                }];
                                user.tickets.push({
                                    sub: req.body.sub,
                                    conv: conv
                                });
                                user.stats.tickets.open++;
                                user.save();
                                uniR(res, true, 'Support ticket created successfully !!');
                            } else {
                                uniR(res, false, 'User not found !!')
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

// Reply to ticket
app.post('/tickets/msg', function(req, res) {
    if (req.body.adminKey && req.body.uId && req.body.tId && req.body.msg) {
        Admin.findOne({
                adminKey: req.body.adminKey
            })
            .then(function(admin) {
                if (admin) {
                    User.findById(req.body.uId)
                        .then(function(user) {
                            if (user) {
                                for (i = 0; i < user.tickets.length; i++) {
                                    if (user.tickets[i]._id == req.body.tId && user.tickets[i].status == "open") {
                                        user.tickets[i].conv.push({
                                            msg: req.body.msg,
                                            person: 1
                                        });
                                        user.save();
                                    }
                                }
                                uniR(res, true, 'Ticket updated successfully !!');
                            } else {
                                uniR(res, false, 'User not found !!')
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

// Close ticket
app.post('/tickets/close', function(req, res) {
    if (req.body.adminKey && req.body.uId && req.body.tId) {
        Admin.findOne({
                adminKey: req.body.adminKey
            })
            .then(function(admin) {
                if (admin) {
                    User.findById(req.body.uId)
                        .then(function(user) {
                            if (user) {
                                for (i = 0; i < user.tickets.length; i++) {
                                    if (user.tickets[i]._id == req.body.tId) {
                                        user.tickets[i].status = "closed";
                                        user.stats.tickets.open--;
                                        user.stats.tickets.closed++;
                                        user.save();
                                    }
                                }
                                uniR(res, true, 'Support ticket closed !!');
                            } else {
                                uniR(res, false, 'User not found !!')
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

// Reopen ticket
app.post('/tickets/reopen', function(req, res) {
    if (req.body.adminKey && req.body.uId && req.body.tId) {
        Admin.findOne({
                adminKey: req.body.adminKey
            })
            .then(function(admin) {
                if (admin) {
                    User.findById(req.body.uId)
                        .then(function(user) {
                            if (user) {
                                for (i = 0; i < user.tickets.length; i++) {
                                    if (user.tickets[i]._id == req.body.tId) {
                                        user.tickets[i].status = "open";
                                        user.stats.tickets.open++;
                                        user.stats.tickets.closed--;
                                        user.save();
                                    }
                                }
                                uniR(res, true, 'Support ticket reopened !!');
                            } else {
                                uniR(res, false, 'User not found !!')
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

module.exports = app;

var express = require('express');
var app = express();
var os = require('os');
var bodyParser = require('body-parser');
var hat = require('hat');
var bcrypt = require('bcryptjs');
var sg = require('sendgrid')('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');
var request = require('request');
var cron = require('node-cron');
var requestIp = require('request-ip');
var cmd = require('node-cmd');
var User = require('../models/user');
var Team = require('../models/team');
var Admin = require('../models/admin');
var Payment = require('../models/payment');
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
                    user.logs = user.logs.reverse().slice(0, 100)
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

app.get('/system', function(req, res) {
    if (req.query.adminKey) {
        Admin.findOne({
                adminKey: req.query.adminKey
            })
            .then(function(user) {
                if (user) {
                    function formatBytes(bytes, exp, decimals) {
                        if (bytes == 0) return '0 Bytes';
                        var k = 1024,
                            dm = decimals || 2,
                            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
                            i = Math.floor(Math.log(bytes) / Math.log(k));
                        if (exp)
                            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
                        else
                            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
                    }
                    User.collection.stats(function(err, results) {
                        var u = results.storageSize;
                        Team.collection.stats(function(err, results) {
                            var t = results.storageSize;
                            Admin.collection.stats(function(err, results) {
                                var a = results.storageSize;
                                cmd.get('cd /root/optimusCP && ./system.sh', function(data, err, stderr) {
                                    var info = err.replace('\n', '').split(':');
                                    res.json({
                                        status: true,
                                        data: {
                                            d: (info[1] * 100) / info[0],
                                            m: (info[3] * 100) / info[2],
                                            c: info[4],
                                            db: formatBytes((u + t + a), true)
                                        }
                                    });
                                });
                            });
                        });
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

// Staff Area
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
                                                var from = new helper.Email('support@optimuscp.io', 'OptimusCP');
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
                                        block: user.conf.block,
                                        plan: user.conf.plan,
                                        stats: user.stats,
                                        tickets: tickets,
                                        apis: user.apis.length,
                                        added: added,
                                        teams: user.teams
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

// View User Activity
app.get('/userActivity/:uId', function(req, res) {
    if (req.query.adminKey && req.params.uId) {
        Admin.findOne({
                adminKey: req.query.adminKey
            })
            .then(function(admin) {
                if (admin) {
                    User.findById(req.params.uId)
                        .then(function(user) {
                            if (user) {
                                var logs = [];
                                user.logs = user.logs.reverse().slice(0, 100);
                                for (i = 0; i < user.logs.length; i++)
                                    logs.push({
                                        no: i,
                                        msg: user.logs[i].msg,
                                        date: user.logs[i].date
                                    });
                                res.json({
                                    status: true,
                                    data: {
                                        id: user._id,
                                        email: user.email,
                                        info: user.info,
                                        plan: user.conf.plan,
                                        stats: user.stats,
                                        apis: user.apis.length,
                                        teams: user.teams.length,
                                        logs: logs
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

// View User Payment
app.get('/userPayment/:uId', function(req, res) {
    if (req.query.adminKey && req.params.uId) {
        Admin.findOne({
                adminKey: req.query.adminKey
            })
            .then(function(admin) {
                if (admin) {
                    User.findById(req.params.uId)
                        .populate('payment')
                        .then(function(user) {
                            if (user) {
                                var payments = [];
                                user.payment = user.payment.reverse();
                                for (i = 0; i < user.payment.length; i++)
                                    payments.push({
                                        no: i,
                                        _id: user.payment[i]._id,
                                        status: user.payment[i].status,
                                        amount: user.payment[i].amount,
                                        modified_at: user.payment[i].modified_at
                                    });
                                res.json({
                                    status: true,
                                    data: {
                                        id: user._id,
                                        email: user.email,
                                        info: user.info,
                                        plan: user.conf.plan,
                                        stats: user.stats,
                                        apis: user.apis.length,
                                        teams: user.teams.length,
                                        payments: payments
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

// View User Payment Invoice
app.get('/userInvoice/:uId', function(req, res) {
    if (req.query.adminKey && req.params.uId && req.query.iId) {
        Admin.findOne({
                adminKey: req.query.adminKey
            })
            .then(function(admin) {
                if (admin) {
                    User.findById(req.params.uId)
                        .populate('payment')
                        .select('payment info')
                        .then(function(user) {
                            if (user && user.payment[0]) {
                                if ((x = user.payment.findIndex(x => x._id == req.query.iId)) >= 0) {
                                    res.json({
                                        status: true,
                                        data: {
                                            info: user.info,
                                            payment: user.payment[x]
                                        }
                                    });
                                } else {
                                    uniR(res, false, 'Invoice ID not found !!');
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
                                    uniR(res, false, 'User already unblocked !!')
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

// View all teams
app.get('/teams', function(req, res) {
    if (req.query.adminKey) {
        Admin.findOne({
                adminKey: req.query.adminKey
            })
            .then(function(admin) {
                if (admin) {
                    Team.find()
                        .then(function(teams) {
                            var team = [],
                                user = 0,
                                server = 0;
                            for (i = 0; i < teams.length; i++) {
                                server += teams[i].added.length;
                                user += teams[i].members.length;
                                team.push({
                                    no: i + 1,
                                    id: teams[i]._id,
                                    name: teams[i].name,
                                    block: teams[i].conf.block,
                                    added: teams[i].added.length,
                                    members: teams[i].members.length
                                });
                            }
                            res.json({
                                status: true,
                                data: {
                                    servers: server,
                                    users: user,
                                    teams: team
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

// View User Activity
app.get('/teamActivity/:tId', function(req, res) {
    if (req.query.adminKey && req.params.tId) {
        Admin.findOne({
                adminKey: req.query.adminKey
            })
            .then(function(admin) {
                if (admin) {
                    Team.findById(req.params.tId)
                        .then(function(team) {
                            if (team) {
                                var logs = [];
                                team.logs = team.logs.reverse().slice(0, 100);
                                for (i = 0; i < team.logs.length; i++)
                                    logs.push({
                                        no: i,
                                        msg: team.logs[i].msg,
                                        user: team.logs[i].user,
                                        date: team.logs[i].date
                                    });
                                res.json({
                                    status: true,
                                    data: {
                                        id: team._id,
                                        name: team.name,
                                        block: team.conf.block,
                                        apis: team.apis.length,
                                        added: team.added.length,
                                        members: team.members.length,
                                        logs: logs
                                    }
                                });
                            } else {
                                uniR(res, false, 'Team not found !!')
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

// View a particular team
app.get('/team/:tId', function(req, res) {
    if (req.query.adminKey && req.params.tId) {
        Admin.findOne({
                adminKey: req.query.adminKey
            })
            .then(function(admin) {
                if (admin) {
                    Team.findById(req.params.tId)
                        .then(function(team) {
                            if (team) {
                                var added = [];
                                for (i = 0; i < team.added.length; i++) {
                                    added.push({
                                        id: team.added[i]._id,
                                        ip: team.added[i].ip,
                                        port: team.added[i].port,
                                        name: team.added[i].name,
                                        os: team.added[i].info.os,
                                        crons: team.added[i].crons.length,
                                        ss: team.added[i].startupScripts.length
                                    });
                                }
                                res.json({
                                    status: true,
                                    data: {
                                        id: team._id,
                                        name: team.name,
                                        block: team.conf.block,
                                        apis: team.apis.length,
                                        added: added,
                                        members: team.members
                                    }
                                });
                            } else {
                                uniR(res, false, 'Team not found !!')
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

// Block Team
app.post('/blockTeam', function(req, res) {
    if (req.body.adminKey && req.body.tId) {
        Admin.findOne({
                adminKey: req.body.adminKey
            })
            .then(function(admin) {
                if (admin) {
                    Team.findById(req.body.tId)
                        .then(function(team) {
                            if (team) {
                                if (team.conf.block == false) {
                                    team.conf.block = true;
                                    team.save();
                                    admin.logs.push({
                                        ip: requestIp.getClientIp(req),
                                        msg: 'Blocked team: ' + team.name + ': id: ' + team._id
                                    });
                                    admin.save();
                                    uniR(res, true, 'Team blocked !!')
                                } else {
                                    uniR(res, false, 'Team already blocked !!')
                                }
                            } else {
                                uniR(res, false, 'Team not found !!')
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
app.post('/unBlockTeam', function(req, res) {
    if (req.body.adminKey && req.body.tId) {
        Admin.findOne({
                adminKey: req.body.adminKey
            })
            .then(function(admin) {
                if (admin) {
                    Team.findById(req.body.tId)
                        .then(function(team) {
                            if (team) {
                                if (team.conf.block == true) {
                                    team.conf.block = false;
                                    team.save();
                                    admin.logs.push({
                                        ip: requestIp.getClientIp(req),
                                        msg: 'UnBlocked team: ' + team.name + ': id: ' + team._id
                                    });
                                    admin.save();
                                    uniR(res, true, 'Team unblocked !!')
                                } else {
                                    uniR(res, false, 'Team already unblocked !!')
                                }
                            } else {
                                uniR(res, false, 'Team not found !!')
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

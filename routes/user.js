var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var hat = require('hat');
var bcrypt = require('bcryptjs');
var cron = require('node-cron');
var sg = require('sendgrid')('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');
var request = require('request');
var User = require('../models/user');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));


//Authentication key Changer
cron.schedule('0 */8 * * *', function () {
	User.find({})
		.then(function (users) {
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
function uniR(res, status, msg) {
	res.json({
		status: status,
		msg: msg
	});
}


app.get('/', function (req, res) {
	if (req.query.authKey) {
		User.findOne({
				authKey: req.query.authKey
			})
			.then(function (user) {
				if (user) {
					var managed = [];
					if (user.managed)
						for (i = 0; i < user.managed.length; i++)
							managed.push({
								_id: user.managed[i]._id,
								name: user.managed[i].name,
								ip: user.managed[i].ip,
								os: user.managed[i].info.os
							});
					res.json({
						status: true,
						msg: 'Here is your data',
						data: {
							email: user.email,
							stats: user.stats,
							managed: managed
						}
					});
				} else {
					uniR(res, false, 'Account not found !!');
				}
			})
			.catch(function (err) {
				uniR(res, false, 'Error when querying');
			});
	} else {
		uniR(res, false, 'Empty Fields !!');
	}
});

app.post('/register', function (req, res) {
	if (req.body.email && req.body.password) {
		bcrypt.hash(req.body.password, 10, function (err, hash) {
			var user = new User();
			user.email = req.body.email;
			user.password = hash;
			user.conf.verified = hat();
			user.authKey = hat();
			user.save()
				.then(function (user) {
					uniR(res, true, 'Successfully Registered, Verify Email by checking your inbox to continue....');
					var helper = require('sendgrid').mail;
					var from = new helper.Email('support@proapi.co');
					var to = new helper.Email(user.email);
					var subject = 'Welcome to OptimusCP ! Confirm Your Email';
					var body = new helper.Content('text/html', user.conf.verified);
					var mail = new helper.Mail(from, subject, to, body);
					mail.personalizations[0].addSubstitution(new helper.Substitution('-email-', req.body.email));
					mail.setTemplateId('af0052d1-7be0-41a5-bf2d-6adb2f87b68c');
					var request = sg.emptyRequest({
						method: 'POST',
						path: '/v3/mail/send',
						body: mail.toJSON(),
					});
					sg.API(request);
				})
				.catch(function (err) {
					console.log(err);
					uniR(res, false, 'Chosen email is already registered !!');
				});
		});
	} else {
		uniR(res, false, 'Empty Fields !!');
	}
});

app.post('/login', function (req, res) {
	if (req.body.email && req.body.password) {
		User.findOne({
				email: req.body.email
			})
			.then(function (user) {
				if (user) {
					if (user.conf.verified == 'true') {
						bcrypt.compare(req.body.password, user.password, function (err, resp) {
							if (resp == true) {
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
			.catch(function (err) {
				uniR(res, false, 'Error when querying');
			});
	} else {
		uniR(res, false, 'Empty Fields !!');
	}
});

app.get('/checkAuth', function (req, res) {
	if (req.query.authKey) {
		User.findOne({
				authKey: req.query.authKey
			})
			.then(function (user) {
				if (user) {
					uniR(res, true, 'Successfully Authenticated !!');
				} else {
					uniR(res, false, 'You are logged out !!');
				}
			})
			.catch(function (err) {
				uniR(res, false, 'Error when querying');
			});
	} else {
		uniR(res, false, 'Empty Fields !!');
	}
});

app.post('/verifyEmail', function (req, res) {
	if (req.body.key && req.body.email) {
		User.findOne({
				email: req.body.email,
				'conf.verified': req.body.key
			})
			.then(function (user) {
				if (user) {
					user.conf.verified = 'true';
					user.save();
					uniR(res, true, 'Successfully verified, login to continue !!');
				} else {
					uniR(res, false, 'Account already verfied / Verification key expired !!');
				}
			})
			.catch(function (err) {
				uniR(res, false, 'Error when querying');
			});
	} else {
		uniR(res, false, 'Empty Fields !!');
	}
});

app.post('/sendEmailVerification', function (req, res) {
	if (req.body.email) {
		User.findOne({
				email: req.body.email
			})
			.then(function (user) {
				if (user) {
					if (user.conf.verified != 'true') {
						user.conf.verified = hat();
						user.save();
						var helper = require('sendgrid').mail;
						var from = new helper.Email('support@proapi.co');
						var to = new helper.Email(user.email);
						var subject = 'Welcome to OptimusCP ! Confirm Your Email';
						var body = new helper.Content('text/html', user.conf.verified);
						var mail = new helper.Mail(from, subject, to, body);
						mail.personalizations[0].addSubstitution(new helper.Substitution('-email-', req.body.email));
						mail.setTemplateId('af0052d1-7be0-41a5-bf2d-6adb2f87b68c');
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
			.catch(function (err) {
				uniR(res, false, 'Error when querying');
			});
	} else {
		uniR(res, false, 'Empty Fields !!');
	}
});

app.post('/forgotPassword', function (req, res) {
	if (req.body.email) {
		User.findOne({
				email: req.body.email
			})
			.then(function (user) {
				if (user) {
					user.conf.pVerify = hat();
					user.save();
					var helper = require('sendgrid').mail;
					var from = new helper.Email('support@proapi.co');
					var to = new helper.Email(user.email);
					var subject = 'Reset your password !!';
					var body = new helper.Content('text/html', user.conf.pVerify);
					var mail = new helper.Mail(from, subject, to, body);
					mail.personalizations[0].addSubstitution(new helper.Substitution('-email-', req.body.email));
					mail.setTemplateId('f72e086b-5754-46c0-9a93-c99bf7768447');
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
			.catch(function (err) {
				uniR(res, false, 'Error when querying');
			});
	} else {
		uniR(res, false, 'Empty Fields !!');
	}
});

app.post('/changePassword', function (req, res) {
	if (req.body.key && req.body.email && req.body.password) {
		User.findOne({
				email: req.body.email,
				'conf.pVerify': req.body.key
			})
			.then(function (user) {
				if (user) {
					bcrypt.hash(req.body.password, 10, function (err, hash) {
						user.password = hash;
						user.save();
						user.conf.pVerify = 'true';
						uniR(res, true, 'Password set successfully !!');
					});
				} else {
					uniR(res, false, 'Account not found !!');
				}
			})
			.catch(function (err) {
				uniR(res, false, 'Error when querying');
			});
	} else {
		uniR(res, false, 'Empty Fields !!');
	}
});

app.post('/payment', function (req, res) {
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
		}, function (error, response, body) {
			if (!error && response.statusCode == 201) {
				res.json(body);
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

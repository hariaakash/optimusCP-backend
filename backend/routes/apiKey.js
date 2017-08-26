var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var hat = require('hat');
var rack = hat.rack();
var User = require('../models/user');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));


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
					res.json({
						status: true,
						data: user.apis
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

app.post('/create', function (req, res) {
	if (req.body.authKey && req.body.name) {
		User.findOne({
				authKey: req.body.authKey
			})
			.then(function (user) {
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
			.catch(function (err) {
				uniR(res, false, 'Error when querying');
			});
	} else {
		uniR(res, false, 'Empty Fields !!');
	}
});

app.post('/delete', function (req, res) {
	if (req.body.authKey && req.body.apiId) {
		User.findOne({
				authKey: req.body.authKey
			})
			.then(function (user) {
				if (user) {
					user.apis.id(req.body.apiId).remove();
					user.save();
					uniR(res, true, 'API Key Deleted !!');
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


module.exports = app;

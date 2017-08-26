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

app.post('/exec', function (req, res) {
	if (req.body.apiKey && req.body.cmd) {
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


module.exports = app;

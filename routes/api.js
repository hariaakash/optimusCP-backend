var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var node_ssh = require('node-ssh');
ssh = new node_ssh();
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

app.get('/servers', function (req, res) {
	if (req.headers.apikey) {
		User.findOne({
				'apis.key': req.headers.apikey
			})
			.then(function (user) {
				if (user) {
					var servers = [];
					for (i = 0; i < user.added.length; i++)
						servers.push({
							id: user.added[i]._id,
							name: user.added[i].name,
							ip: user.added[i].ip,
							port: user.added[i].port,
							uname: user.added[i].uname,
							info: user.added[i].info
						});
					res.json({
						status: true,
						servers: servers
					});
				} else {
					uniR(res, false, 'Account not found !!');
				}
			})
			.catch(function (err) {
				uniR(res, false, 'Error when querying - Server Error !!');
			});
	} else {
		uniR(res, false, 'Empty Fields !!');
	}
});

app.post('/server/exec', function (req, res) {
	if (req.headers.apikey && req.body.serverId && req.body.cmd) {
		User.findOne({
				'apis.key': req.headers.apikey
			})
			.then(function (user) {
				if (user) {
					var index = -1;
					for (i = 0; i < user.added.length; i++)
						if (user.added[i]._id == req.body.serverId)
							index = i;
					if (index != -1) {
						ssh.connect({
								host: user.added[index].ip,
								port: user.added[index].port,
								username: 'optimusCP',
								password: String(user.added[index]._id)
							})
							.then(function () {
								ssh.execCommand('sudo sh -c "' + req.body.cmd + '"')
									.then(function (result) {
										var aId = -1;
										for (j = 0; j < user.added.length; j++)
											if (user.apis[j].key == req.headers.apikey)
												aId = j;
										user.apis[aId].hits += 1;
										user.apis[aId].logs.push({
											ip: user.added[index].ip,
											cmd: req.body.cmd,
											error: result.stderr,
											result: result.stdout
										});
										user.save();
										res.json({
											status: true,
											error: result.stdout,
											result: result.stderr
										});
									});
							})
							.catch(function (err) {
								console.log(err);
								res.json({
									status: false,
									msg: 'Session Timed out',
									error: err
								});
							});
					} else {
						uniR(res, false, 'Server Id wrong !!');
					}
				} else {
					uniR(res, false, 'Account not found !!');
				}
			})
			.catch(function (err) {
				uniR(res, false, 'Error when querying - Server Error !!');
			});
	} else {
		uniR(res, false, 'Empty Fields !!');
	}
});


module.exports = app;

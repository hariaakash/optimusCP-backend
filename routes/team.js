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
					var teams = [];
					var c = 0;
					for (i = 0; i < user.teams.length; i++) {
						Team.findOne({
								name: user.teams[i].name
							})
							.then(function (team) {
								teams.push({
									id: team._id,
									name: team.name,
									members: 1 + team.members.length,
									added: team.added.length,
								});
								c++;
								if (c == user.teams.length)
									res.json({
										status: true,
										data: teams
									});
							})
							.catch(function (err) {
								console.log(err)
								uniR(res, false, 'Error when querying');
							});
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

app.post('/create', function (req, res) {
	if (req.body.authKey && req.body.tName) {
		User.findOne({
				authKey: req.body.authKey
			})
			.then(function (user) {
				if (user) {
					Team.findOne({
							name: req.body.tName
						})
						.then(function (checkTeam) {
							if (!checkTeam) {
								var team = new Team();
								team.name = req.body.tName;
								team.admin = user.email;
								team.logs.push({
									ip: requestIp.getClientIp(req),
									msg: 'Team created'
								});
								team.save();
								user.teams.push({
									name: req.body.tName
								});
								user.logs.push({
									ip: requestIp.getClientIp(req),
									msg: 'Created team: ' + req.body.tName
								});
								user.save();
								uniR(res, true, 'Team created successfully !!')
							} else {
								uniR(res, false, 'Team name already chosen !!')
							}
						})
						.catch(function (err) {
							uniR(res, false, 'Error when querying');
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

app.post('/delete', function (req, res) {
	if (req.body.authKey && req.body.tName) {
		User.findOne({
				authKey: req.body.authKey
			})
			.then(function (user) {
				if (user) {
					Team.findOne({
							name: req.body.tName
						})
						.then(function (team) {
							if (team && team.admin == user.email) {
								user.teams = user.teams.filter(function (team) {
									return team.name != req.body.tName;
								});
								user.logs.push({
									ip: requestIp.getClientIp(req),
									msg: 'Removed team: ' + req.body.tName
								});
								user.save();
								for (i = 0; i < team.members.length; i++) {
									User.findById(team.members[i].uId)
										.then(function (teamMember) {
											teamMember.logs.push({
												ip: requestIp.getClientIp(req),
												msg: 'Team: ' + req.body.tName + ' got deleted'
											});
											teamMember.teams = teamMember.teams.filter(function (team) {
												return team.name != req.body.tName;
											});
											teamMember.save();
										});
								}
								team.remove();
								uniR(res, true, 'Team Deleted !!')
							} else {
								uniR(res, false, 'Team not found !!')
							}
						})
						.catch(function (err) {
							uniR(res, false, 'Error when querying');
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

app.post('/addMember', function (req, res) {
	if (req.body.authKey && req.body.tName && req.body.email) {
		User.findOne({
				authKey: req.body.authKey
			})
			.then(function (user) {
				if (user) {
					Team.findOne({
							name: req.body.tName
						})
						.then(function (team) {
							if (team) {
								User.findOne({
										email: req.body.email
									})
									.then(function (checkUser) {
										if (checkUser) {
											var c = 0;
											for (i = 0; i < team.members.length; i++)
												if (team.members[i].email == req.body.email)
													c++;
											if (c == 0 && team.admin != req.body.email) {
												team.members.push({
													uId: checkUser._id,
													email: checkUser.email
												});
												team.logs.push({
													ip: requestIp.getClientIp(req),
													msg: 'Added member: ' + req.body.email
												});
												team.save();
												checkUser.teams.push({
													name: team.name,
													admin: 0
												});
												checkUser.logs.push({
													ip: '',
													msg: 'Added to team: ' + team.name
												});
												checkUser.save();
												uniR(res, true, 'Member added successfully !!')
											} else {
												uniR(res, false, 'Member is already part of team')
											}
										} else {
											uniR(res, false, 'Invitation sent !!')
										}
									})
									.catch(function (err) {
										uniR(res, false, 'Error when querying')
									})
							} else {
								uniR(res, false, 'Team not found !!')
							}
						})
						.catch(function (err) {
							uniR(res, false, 'Error when querying');
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

app.post('/delMember', function (req, res) {
	if (req.body.authKey && req.body.tName && req.body.email) {
		User.findOne({
				authKey: req.body.authKey
			})
			.then(function (user) {
				if (user) {
					Team.findOne({
							name: req.body.tName
						})
						.then(function (team) {
							if (team) {
								User.findOne({
										email: req.body.email
									})
									.then(function (checkUser) {
										if (checkUser) {
											var c = 0;
											for (i = 0; i < team.members.length; i++)
												if (team.members[i].email == req.body.email)
													c++;
											if (c > 0) {
												team.members = team.members.filter(function (member) {
													return member.email != req.body.email;
												});
												team.logs.push({
													ip: requestIp.getClientIp(req),
													msg: 'Removed member: ' + req.body.email
												});
												team.save();
												checkUser.teams = checkUser.teams.filter(function (t) {
													return t.name != team.name;
												});
												checkUser.logs.push({
													ip: '',
													msg: 'Removed from team: ' + team.name
												});
												checkUser.save();
												uniR(res, true, 'Removed member successfully !!')
											} else {
												uniR(res, false, 'User already removed / not part of team')
											}
										} else {
											uniR(res, false, 'Invitation sent !!')
										}
									})
									.catch(function (err) {
										uniR(res, false, 'Error when querying')
									})
							} else {
								uniR(res, false, 'Team not found !!')
							}
						})
						.catch(function (err) {
							uniR(res, false, 'Error when querying');
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


module.exports = app;

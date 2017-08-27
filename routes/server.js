var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var node_ssh = require('node-ssh');
ssh = new node_ssh();
var requestIp = require('request-ip');
var moment = require('moment');
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

// Bytes to Readable
function formatBytes(a, b) {
	//	if (0 == a) return "0 Bytes";
	//	var c = 1e3,
	//		d = b || 2,
	//		e = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
	//		f = Math.floor(Math.log(a) / Math.log(c));
	//	return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f]
	return (a / 1048576).toFixed(2)
}


app.get('/m-det', function (req, res) {
	if (req.query.authKey && req.query.serverId) {
		User.findOne({
				authKey: req.query.authKey
			})
			.then(function (user) {
				if (user) {
					var server = user.added.filter(function (server) {
						return server._id == req.query.serverId;
					});
					var metrics = server[0].metrics;
					var latest = [],
						d = [],
						m = [],
						seriesOptions = [];
					for (i = 0; i < metrics.length; i++) {
						latest.push({
							date: metrics[i].date,
							d_u: formatBytes(metrics[i].d_u),
							d_t: formatBytes(metrics[i].d_t),
							m_u: formatBytes(metrics[i].m_u),
							m_t: formatBytes(metrics[i].m_t),
							m: (metrics[i].m_u * 100 / metrics[i].m_t).toFixed(2),
							d: (metrics[i].d_u * 100 / metrics[i].d_t).toFixed(2)
						});
						d.push([moment(metrics[i].date).valueOf(), parseFloat((metrics[i].d_u * 100 / metrics[i].d_t).toFixed(2))]);
						m.push([moment(metrics[i].date).valueOf(), parseFloat((metrics[i].m_u * 100 / metrics[i].m_t).toFixed(2))]);
					}
					seriesOptions.push({
						name: 'Memory',
						compare: 'percent',
						data: m,
						gapSize: 5,
						type: 'area'
					}, {
						name: 'Disk',
						compare: 'percent',
						gapSize: 5,
						data: d,
						type: 'area'
					});
					res.json({
						status: true,
						data: {
							id: String(server[0]._id),
							ip: server[0].ip,
							port: server[0].port,
							name: server[0].name,
							uname: server[0].uname,
							info: server[0].info,
							metrics: latest[latest.length - 1],
							seriesOptions: seriesOptions,
							crons: server[0].crons.length,
							startupScripts: server[0].startupScripts.length
						}
					});
				} else {
					uniR(res, false, 'Account not found !!');
				}
			})
			.catch(function (err) {
				console.log(err);
				uniR(res, false, 'Error when querying');
			});
	} else {
		uniR(res, false, 'Empty Fields !!');
	}
});

app.post('/m-add', function (req, res) {
	if (req.body.authKey && req.body.ip && req.body.uname && req.body.password && req.body.name && req.body.port) {
		User.findOne({
				authKey: req.body.authKey
			})
			.then(function (user) {
				if (user) {
					user.stats.added++;
					ssh.connect({
							host: req.body.ip,
							port: req.body.port,
							username: req.body.uname,
							password: req.body.password
						})
						.then(function () {
							ssh.execCommand('sudo -n true')
								.then(function (result) {
									if (!result.stderr) {
										ssh.execCommand('cd / && mkdir -p optimusCP && cd optimusCP && wget https://www.dropbox.com/s/35cwxe0xzas60x8/os.sh?dl=1 -O os.sh && chmod +x os.sh && ./os.sh')
											.then(function (result) {
												user.added.push({
													ip: req.body.ip,
													port: req.body.port,
													uname: req.body.uname,
													name: req.body.name,
													'info.os': result.stdout.split('\n')[0],
													'info.hname': result.stdout.split('\n')[1]
												});
												user.logs.push({
													ip: requestIp.getClientIp(req),
													msg: 'Added Server with IP: ' + req.body.ip
												});
												user.save()
													.then(function (updatedUser) {
														ssh.execCommand('cd /optimusCP && sudo apt-get -y install dos2unix && wget "https://www.dropbox.com/s/abvs179kertlunv/metrics.sh?dl=1" -O metrics.sh && chmod +x metrics.sh && dos2unix metrics.sh && (crontab -l ; echo "*/5 * * * * /optimusCP/metrics.sh ' + updatedUser._id + ' ' + updatedUser.added[updatedUser.added.length - 1]._id + '") 2>&1 | grep -v "no crontab" | sort | uniq | crontab - && adduser --disabled-password --gecos \"\" optimusCP --force-badname && echo -e "' + updatedUser.added[updatedUser.added.length - 1]._id + '\n' + updatedUser.added[updatedUser.added.length - 1]._id + '" | passwd optimusCP && echo "optimusCP ALL=(ALL:ALL) NOPASSWD: ALL" >> /etc/sudoers && service ssh restart')
															.then(function (result) {
																console.log(result);
															});
													});
												uniR(res, true, 'Server added successfully !!');
											});
									} else {
										uniR(res, false, 'Only root user allowed !!');
									}
								});
						})
						.catch(function (err) {
							uniR(res, false, 'Either server is down / Authentication failed');
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

app.post('/m-remove', function (req, res) {
	if (req.body.authKey && req.body.serverId) {
		User.findOne({
				authKey: req.body.authKey
			})
			.then(function (user) {
				if (user) {
					user.added.id(req.body.serverId).remove();
					user.stats.added--;
					user.logs.push({
						ip: requestIp.getClientIp(req),
						msg: 'Removed a server'
					});
					user.save();
					uniR(res, true, 'Server removed successfully !!');
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

app.post('/exec', function (req, res) {
	if (req.body.authKey && req.body.serverId && ((req.body.cmd == 1 || req.body.cmd == 3 || req.body.cmd == 6) || (req.body.cmd == 2 && req.body.hname) || (req.body.cmd == 4 && req.body.password) || (req.body.cmd == 5 && req.body.command))) {
		User.findOne({
				authKey: req.body.authKey
			})
			.then(function (user) {
				if (user) {
					var index = 1;
					for (i = 0; i < user.added.length; i++)
						if (user.added[i]._id == req.body.serverId)
							index = i;
					if (user.added[index]) {
						var cmd = '';
						var msg = '';

						function exec() {
							ssh.connect({
									host: user.added[index].ip,
									port: user.added[index].port,
									username: 'optimusCP',
									password: String(user.added[index]._id)
								})
								.then(function () {
									ssh.execCommand('sudo sh -c "' + cmd + '"')
										.then(function (result) {
											if (req.body.cmd == 4) {
												user.added[index].password = req.body.password;
												user.save();
											}
											if (req.body.cmd == 5) {
												res.json({
													status: true,
													msg: msg,
													result: result
												});
											} else
												uniR(res, true, msg);
											console.log(result);
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
						}
						switch (req.body.cmd) {
							case 1:
								cmd = 'reboot';
								msg = 'Restarted successfully !!';
								exec();
								break;
							case 2:
								cmd = 'hostnamectl set-hostname ' + req.body.hname
								user.added[index].info.hname = req.body.hname;
								user.save();
								msg = 'Hostname changed successfully !!';
								exec();
								break;
							case 3:
								cmd = 'sudo apt-get update && sudo apt-get -y upgrade && sudo apt-get -y dist-upgrade'
								msg = 'System updated successfully !!';
								exec();
								break;
							case 4:
								cmd = 'echo -e "' + req.body.password + '\n' + req.body.password + '" | passwd ' + user.added[index].uname
								msg = 'New password successfully set !!';
								exec();
								break;
							case 5:
								cmd = req.body.command;
								msg = 'Your command executed successfully !!'
								exec();
								break;
							case 6:
								cmd = 'cd /optimusCP && wget https://www.dropbox.com/s/ddcqxk8120sclyt/lamp.sh?dl=1 -O lamp.sh && chmod +x lamp.sh && dos2unix lamp.sh && ./lamp.sh ' + user.added[index].password
								msg = 'LAMP is getting installed...'
								exec();
								break;
							default:
								uniR(res, false, 'Command not found !!');
								break;
						}
					} else {
						uniR(res, false, 'Server not found !!');
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

app.post('/m-name', function (req, res) {
	if (req.body.authKey && req.body.serverId && req.body.name) {
		User.findOne({
				authKey: req.body.authKey
			})
			.then(function (user) {
				if (user) {
					for (i = 0; i < user.added.length; i++)
						if (user.added[i]._id == req.body.serverId) {
							user.added[i].name = req.body.name;
							user.save();
						}
					uniR(res, true, 'Server name changed successfully !!');
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

app.post('/addCron', function (req, res) {
	if (req.body.authKey && req.body.serverId && req.body.cmd && req.body.exp) {
		User.findOne({
				authKey: req.body.authKey
			})
			.then(function (user) {
				if (user) {
					for (i = 0; i < user.added.length; i++)
						if (user.added[i]._id == req.body.serverId) {
							user.added[i].crons.push({
								cmd: req.body.cmd,
								exp: req.body.exp
							});
							ssh.connect({
									host: user.added[i].ip,
									port: user.added[i].port,
									username: 'optimusCP',
									password: String(user.added[i]._id)
								})
								.then(function () {
									ssh.execCommand('(crontab -l ; echo "' + req.body.exp + ' ' + req.body.cmd + '") 2>&1 |  crontab -')
										.then(function (result) {
											user.save();
											uniR(res, true, 'Cron Added Successfully');
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

app.post('/delCron', function (req, res) {
	if (req.body.authKey && req.body.serverId && req.body.cronId) {
		User.findOne({
				authKey: req.body.authKey
			})
			.then(function (user) {
				if (user) {
					for (i = 0; i < user.added.length; i++)
						if (user.added[i]._id == req.body.serverId)
							for (j = 0; j < user.added[i].crons.length; j++)
								if (user.added[i].crons[j]._id == req.body.cronId) {
									var cmd = 'crontab -l | grep -v \'' + user.added[i].crons[j].cmd + '\' | crontab -';
									user.added[i].crons = user.added[i].crons.filter(function (cron) {
										return cron._id != req.body.cronId;
									});
									ssh.connect({
											host: user.added[i].ip,
											port: user.added[i].port,
											username: 'optimusCP',
											password: String(user.added[i]._id)
										})
										.then(function () {
											ssh.execCommand(cmd)
												.then(function (result) {
													user.save();
													uniR(res, true, 'Cron Removed Successfully');
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

app.post('/addStartupScript', function (req, res) {
	if (req.body.authKey && req.body.serverId && req.body.cmd) {
		User.findOne({
				authKey: req.body.authKey
			})
			.then(function (user) {
				if (user) {
					for (i = 0; i < user.added.length; i++)
						if (user.added[i]._id == req.body.serverId) {
							user.added[i].startupScripts.push({
								cmd: req.body.cmd
							});
							ssh.connect({
									host: user.added[i].ip,
									port: user.added[i].port,
									username: 'optimusCP',
									password: String(user.added[i]._id)
								})
								.then(function () {
									ssh.execCommand('(crontab -l ; echo "@reboot ' + req.body.cmd + '") 2>&1 |  crontab -')
										.then(function (result) {
											user.save();
											uniR(res, true, 'Startup Script Added Successfully');
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

app.post('/delStartupScript', function (req, res) {
	if (req.body.authKey && req.body.serverId && req.body.startupScriptId) {
		User.findOne({
				authKey: req.body.authKey
			})
			.then(function (user) {
				if (user) {
					for (i = 0; i < user.added.length; i++)
						if (user.added[i]._id == req.body.serverId)
							for (j = 0; j < user.added[i].startupScripts.length; j++)
								if (user.added[i].startupScripts[j]._id == req.body.startupScriptId) {
									var cmd = 'crontab -l | grep -v \'' + user.added[i].startupScripts[j].cmd + '\' | crontab -';
									user.added[i].startupScripts = user.added[i].startupScripts.filter(function (startupScript) {
										return startupScript._id != req.body.startupScriptId;
									});
									ssh.connect({
											host: user.added[i].ip,
											port: user.added[i].port,
											username: 'optimusCP',
											password: String(user.added[i]._id)
										})
										.then(function () {
											ssh.execCommand(cmd)
												.then(function (result) {
													user.save();
													uniR(res, true, 'Startup Script Removed Successfully');
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

app.post('/metrics/:userId/:serverId', function (req, res) {
	if (req.params.serverId && req.params.userId) {
		User.findById(req.params.userId)
			.then(function (user) {
				if (user) {
					var index = 1;
					for (i = 0; i < user.added.length; i++)
						if (user.added[i]._id == req.params.serverId)
							index = i;
					user.added[index].metrics.push({
						m_t: req.body.m_t,
						m_u: req.body.m_u,
						d_t: req.body.d_t,
						d_u: req.body.d_u,
					});
					user.save();
					uniR(res, true, 'Metrics received !!');
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
app.get('/embed', function (req, res) {
	if (req.query.serverId) {
		User.findOne({
				'added._id': req.query.serverId
			})
			.then(function (user) {
				if (user) {
					var server = user.added.filter(function (server) {
						return server._id == req.query.serverId;
					});
					var metrics = server[0].metrics;
					var d = [],
						m = [],
						seriesOptions = [];
					for (i = 0; i < metrics.length; i++) {
						d.push([moment(metrics[i].date).valueOf(), parseFloat((metrics[i].d_u * 100 / metrics[i].d_t).toFixed(2))]);
						m.push([moment(metrics[i].date).valueOf(), parseFloat((metrics[i].m_u * 100 / metrics[i].m_t).toFixed(2))]);
					}
					seriesOptions.push({
						name: 'Memory',
						compare: 'percent',
						data: m,
						gapSize: 5,
						type: 'area'
					}, {
						name: 'Disk',
						compare: 'percent',
						gapSize: 5,
						data: d,
						type: 'area'
					});
					res.json({
						status: true,
						data: {
							ip: server[0].ip,
							seriesOptions: seriesOptions
						}
					});
				} else {
					uniR(res, false, 'Account not found !!');
				}
			})
			.catch(function (err) {
				console.log(err);
				uniR(res, false, 'Error when querying');
			});
	} else {
		uniR(res, false, 'Empty Fields !!');
	}
});


module.exports = app;

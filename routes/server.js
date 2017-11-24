var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var node_ssh = require('node-ssh');
ssh = new node_ssh();
var requestIp = require('request-ip');
var moment = require('moment');
var multer = require('multer');
var fs = require('fs');
var hat = require('hat');
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
function formatBytes(a) {
	return (a / 1048576).toFixed(2)
}

function formatBytesStr(a, b) {
	if (0 == a) return "0 Bytes";
	var c = 1e3,
		d = b || 2,
		e = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
		f = Math.floor(Math.log(a) / Math.log(c));
	return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f]
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
					var logs = [];
					server[0].logs = server[0].logs.reverse()
					for (i = 0; i < server[0].logs.length; i++)
						logs.push({
							no: i,
							msg: server[0].logs[i].msg,
							date: server[0].logs[i].date
						})
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
							crons: server[0].crons,
							startupScripts: server[0].startupScripts,
							logs: logs
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
	if (req.body.authKey && req.body.ip && req.body.uname && (req.body.password || req.body.file) && req.body.name && req.body.port && req.body.authType) {
		User.findOne({
				authKey: req.body.authKey
			})
			.then(function (user) {
				if (user) {
					user.stats.added++;
					if (req.body.authType == 1) {
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
											ssh.execCommand('wget https://optimuscp.io/bash/os.sh -O os.sh && chmod +x os.sh && ./os.sh && rm os.sh')
												.then(function (result) {
													user.added.push({
														ip: req.body.ip,
														port: req.body.port,
														authType: req.body.authType,
														uname: req.body.uname,
														name: req.body.name,
														logs: [{
															msg: 'Server created'
														}],
														'info.os': result.stdout.split('\n')[0],
														'info.hname': result.stdout.split('\n')[1]
													});
													user.logs.push({
														ip: requestIp.getClientIp(req),
														msg: 'Added Server with IP: ' + req.body.ip
													});
													ssh.execCommand('sudo useradd -m -ou 0 -g 0 -s /bin/bash optimusCP && echo -e "' + user.added[user.added.length - 1]._id + '\n' + user.added[user.added.length - 1]._id + '" | passwd optimusCP && echo "optimusCP ALL=(ALL:ALL) NOPASSWD: ALL" >> /etc/sudoers && service ssh restart')
														.then(function (result) {
															console.log(result);
															ssh.connect({
																	host: req.body.ip,
																	port: req.body.port,
																	username: 'optimusCP',
																	password: String(user.added[user.added.length - 1]._id)
																})
																.then(function () {
																	ssh.execCommand('sudo apt-get -y install dos2unix && wget https://optimuscp.io/bash/metrics.sh -O metrics.sh && chmod +x metrics.sh && dos2unix metrics.sh && (crontab -l ; echo "*/5 * * * * /home/optimusCP/metrics.sh ' + user._id + ' ' + user.added[user.added.length - 1]._id + '") 2>&1 | grep -v "no crontab" | sort | uniq | crontab -')
																		.then(function (result) {
																			console.log(result);
																			user.save();
																			uniR(res, true, 'Server added successfully !!');
																		});
																})
																.catch(function (err) {
																	console.log(err)
																	uniR(res, false, 'Some error occurred when adding server, try again !!')
																});
														})
														.catch(function (err) {
															uniR(res, false, 'Server is already being managed by OptimusCP')
														});
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
						var file = './uploads/' + req.body.file + '.pem';
						ssh.connect({
								host: req.body.ip,
								port: req.body.port,
								username: req.body.uname,
								privateKey: fs.readFileSync(file, "utf8")
							})
							.then(function () {
								ssh.execCommand('sudo -n true')
									.then(function (result) {
										if (!result.stderr) {
											ssh.execCommand('wget https://optimuscp.io/bash/os.sh -O os.sh && chmod +x os.sh && ./os.sh && rm os.sh')
												.then(function (result) {
													console.log(result)
													user.added.push({
														ip: req.body.ip,
														port: req.body.port,
														authType: req.body.authType,
														uname: req.body.uname,
														name: req.body.name,
														logs: [{
															msg: 'Server created'
														}],
														'info.os': result.stdout.split('\n')[0],
														'info.hname': result.stdout.split('\n')[1]
													});
													user.logs.push({
														ip: requestIp.getClientIp(req),
														msg: 'Added Server with IP: ' + req.body.ip
													});
													var cmd = 'sudo -i /bin/bash -c "sudo useradd -m -ou 0 -g 0 -s /bin/bash optimusCP && echo -e \\"' + user.added[user.added.length - 1]._id + '\\n' + user.added[user.added.length - 1]._id + '\\" | sudo passwd optimusCP && echo \\"optimusCP ALL=(ALL:ALL) NOPASSWD: ALL\\" >> /etc/sudoers && service ssh restart && sudo sed -i \\"s/^PasswordAuthentication.*/PasswordAuthentication yes/\\" /etc/ssh/sshd_config && service sshd reload"';
													ssh.execCommand(cmd)
														.then(function (result) {
															console.log(result)
															fs.unlink(file, function (err) {});
															ssh.connect({
																	host: req.body.ip,
																	port: req.body.port,
																	username: 'optimusCP',
																	password: String(user.added[user.added.length - 1]._id)
																})
																.then(function () {
																	ssh.execCommand('sudo apt-get -y install dos2unix && wget https://optimuscp.io/bash/metrics.sh -O metrics.sh && chmod +x metrics.sh && dos2unix metrics.sh && (crontab -l ; echo "*/5 * * * * /home/optimusCP/metrics.sh ' + user._id + ' ' + user.added[user.added.length - 1]._id + '") 2>&1 | grep -v "no crontab" | sort | uniq | crontab -')
																		.then(function (result) {
																			console.log(result);
																			user.save();
																			uniR(res, true, 'Server added successfully !!');
																		});
																})
																.catch(function (err) {
																	console.log(err)
																	uniR(res, false, 'Some error occurred when adding server, try again !!')
																});
														})
														.catch(function (err) {
															uniR(res, false, 'Server is already being managed by OptimusCP')
														});
												})
												.catch(function (err) {
													console.log(err);
													uniR(res, false, 'Server is down / auth failed')
												})
										} else {
											uniR(res, false, 'Only root user allowed !!');
										}
									})
									.catch(function (err) {
										console.log(err)
									});
							})
							.catch(function (err) {
								console.log(err)
								uniR(res, false, 'Either server is down / Authentication failed');
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
	if (req.body.authKey && req.body.serverId && (req.body.cmd == 1 || (req.body.cmd == 2 && req.body.hname) || req.body.cmd == 3 || req.body.cmd == 5 || req.body.cmd == 6 || req.body.cmd == 7 || req.body.cmd == 8)) {
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
						var cmd = '',
							msg = '';

						function exec() {
							ssh.connect({
									host: user.added[index].ip,
									port: user.added[index].port,
									username: 'optimusCP',
									password: String(user.added[index]._id)
								})
								.then(function () {
									if (req.body.cmd == 3 || req.body.cmd == 5 || req.body.cmd == 6)
										uniR(res, true, msg)
									ssh.exec(cmd)
										.then(function (result) {
											console.log(result)
											if (req.body.cmd != 3 && req.body.cmd != 5 || req.body.cmd != 6)
												uniR(res, true, msg);
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
								cmd = 'sudo reboot';
								msg = 'Restarted successfully !!';
								user.added[index].logs.push({
									msg: 'Restarted server'
								});
								user.save();
								exec();
								break;
							case 2:
								cmd = 'sudo hostnamectl set-hostname ' + req.body.hname
								user.added[index].info.hname = req.body.hname;
								user.added[index].logs.push({
									msg: 'Changed hostname to ' + req.body.hname
								});
								user.save();
								msg = 'Hostname changed successfully !!';
								exec();
								break;
							case 3:
								cmd = 'sudo apt-get update && sudo apt-get -y upgrade && sudo apt-get -y dist-upgrade'
								msg = 'System will be updated !!';
								user.added[index].logs.push({
									msg: 'Updated server'
								});
								user.save();
								exec();
								break;
							case 5:
								cmd = 'wget https://optimuscp.io/bash/lamp.sh -O lamp.sh && chmod +x lamp.sh && dos2unix lamp.sh && ./lamp.sh ' + user.added[index]._id
								msg = 'LAMP is getting installed with mysql password: ' + user.added[index]._id
								user.added[index].logs.push({
									msg: 'Installed LAMP with password: ' + user.added[index]._id
								});
								user.save();
								exec();
								break;
							case 6:
								cmd = 'wget https://optimuscp.io/bash/mean.sh -O mean.sh && chmod +x mean.sh && dos2unix mean.sh && ./mean.sh';
								msg = 'MEAN is getting installed'
								user.added[index].logs.push({
									msg: 'Installed MEAN Stack'
								});
								user.save();
								exec();
								break;
							case 7:
								cmd = 'wget https://optimuscp.io/bash/django.sh -O django.sh && chmod +x django.sh && dos2unix django.sh && ./django.sh';
								msg = 'Django is getting installed'
								user.added[index].logs.push({
									msg: 'Installed Django Framework'
								});
								user.save();
								exec();
								break;
							case 8:
								cmd = 'wget https://optimuscp.io/bash/rails.sh -O rails.sh && chmod +x rails.sh && dos2unix rails.sh && ./rails.sh';
								msg = 'Ruby on Rails is getting installed'
								user.added[index].logs.push({
									msg: 'Installed Ruby on Rails Framework'
								});
								user.save();
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
							user.added[i].logs.push({
								msg: 'Changed server name to ' + req.body.name
							});
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
							user.added[i].logs.push({
								msg: 'Added cron with command: ' + req.body.cmd
							});
							ssh.connect({
									host: user.added[i].ip,
									port: user.added[i].port,
									username: 'optimusCP',
									password: String(user.added[i]._id)
								})
								.then(function () {
									var cmd = '(crontab -l ; echo "' + req.body.exp + ' ' + req.body.cmd + '") 2>&1 |  crontab -';
									console.log(cmd)
									ssh.execCommand(cmd)
										.then(function (result) {
											console.log(result)
											user.save()
												.then(function (user) {
													uniR(res, true, 'Cron Added Successfully');
												})
												.catch(function (err) {
													console.log(err)
													uniR(res, false, 'Error adding cron !!')
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
									var cmd = 'crontab -l | grep -v "' + user.added[i].crons[j].cmd + '" | crontab -';
									user.added[i].logs.push({
										msg: 'Removed cron with command: ' + user.added[i].crons[j].cmd
									});
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
							user.added[i].logs.push({
								msg: 'Added startup script with command: ' + req.body.cmd
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
									var cmd = 'crontab -l | grep -v "' + user.added[i].startupScripts[j].cmd + '" | crontab -';
									user.added[i].logs.push({
										msg: 'Removed startup script with command: ' + user.added[i].startupScripts[j].cmd
									});
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
	if (req.params.serverId && req.params.userId && req.body.m_t) {
		User.findById(req.params.userId)
			.then(function (user) {
				if (user) {
					var index = -1;
					for (i = 0; i < user.added.length; i++)
						if (user.added[i]._id == req.params.serverId)
							index = i;
					if (index != -1) {
						user.added[index].metrics.push({
							m_t: req.body.m_t,
							m_u: req.body.m_u,
							d_t: req.body.d_t,
							d_u: req.body.d_u,
							m: parseFloat((req.body.m_u * 100 / req.body.m_t).toFixed(2)),
							d: parseFloat((req.body.d_u * 100 / req.body.d_t).toFixed(2))
						});
						user.save();
						uniR(res, true, 'Metrics received !!');
					} else {
						uniR(res, false, 'Error receiving');
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

app.post('/uploadPrivateKey', function (req, res) {
	var filename = Date.now() + hat();
	var storage = multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, './uploads/')
		},
		filename: function (req, file, cb) {
			cb(null, filename + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
		}
	});
	var upload = multer({
		storage: storage
	}).single('file');
	upload(req, res, function (err) {
		if (err) {
			uniR(res, false, 'Error uploading file')
		} else {
			res.json({
				status: true,
				file: filename
			})
		}
	});
})


module.exports = app;

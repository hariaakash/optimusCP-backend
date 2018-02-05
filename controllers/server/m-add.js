module.exports = function(req, res, fs, ssh, requestIp, uniR, user) {
    user.stats.added++;
    if (req.body.authType == 1) {
        ssh.connect({
                host: req.body.ip,
                port: req.body.port,
                username: req.body.uname,
                password: req.body.password
            })
            .then(function() {
                ssh.execCommand('sudo -n true')
                    .then(function(result) {
                        if (!result.stderr) {
                            ssh.execCommand('curl -O https://optimuscp.io/bash/os.sh && chmod +x os.sh && ./os.sh && rm -f os.sh')
                                .then(function(result) {
                                    user.added.push({
                                        ip: req.body.ip,
                                        port: req.body.port,
                                        authType: req.body.authType,
                                        name: req.body.name,
                                        msgboard: {
                                            msg: 'Server is currently being configured !!',
                                            time: 1 * 60 * 1000
                                        },
                                        logs: [{
                                            msg: 'Server created'
                                        }],
                                        monitorLogs: [{
                                            isReachable: true
                                        }],
                                        'info.os': result.stdout.split('\n')[0],
                                        'info.hname': result.stdout.split('\n')[1]
                                    });
                                    user.logs.push({
                                        ip: requestIp.getClientIp(req),
                                        msg: 'Added Server with IP: ' + req.body.ip
                                    });
                                    if ((result.stdout.split('\n')[0].indexOf("CentOS") >= 0) || (result.stdout.split('\n')[0].indexOf("Ubuntu") >= 0)) {
                                        var oscmd = (result.stdout.split('\n')[0].indexOf("CentOS") >= 0) ? 'yum' : 'apt-get';
                                        ssh.execCommand('sudo useradd -m -ou 0 -g 0 -s /bin/bash optimusCP && echo -e "' + user.added[user.added.length - 1]._id + '\n' + user.added[user.added.length - 1]._id + '" | passwd optimusCP && echo "optimusCP ALL=(ALL:ALL) NOPASSWD: ALL" >> /etc/sudoers && echo "\\nAllowUsers optimusCP\@optimuscp.io" >> /etc/ssh/sshd_config && service ssh restart')
                                            .then(function(result) {
                                                if (!result.stderr.includes('already exists')) {
                                                    ssh.connect({
                                                            host: req.body.ip,
                                                            port: req.body.port,
                                                            username: 'optimusCP',
                                                            password: String(user.added[user.added.length - 1]._id)
                                                        })
                                                        .then(function() {
                                                            ssh.execCommand('sudo ' + oscmd + ' -y install wget && wget -O metrics.sh https://optimuscp.io/bash/metrics.sh && chmod +x metrics.sh && sed -i "s/\x0D$//" metrics.sh && (crontab -l ; echo "*/5 * * * * /home/optimusCP/metrics.sh ' + user._id + ' ' + user.added[user.added.length - 1]._id + '") 2>&1 | grep -v "no crontab" | sort | uniq | crontab -')
                                                                .then(function(result) {
                                                                    user.save();
                                                                    uniR(res, true, 'Server added successfully !!');
                                                                });
                                                        })
                                                        .catch(function(err) {
                                                            console.log(err)
                                                            uniR(res, false, 'Some error occurred when adding server, try again !!')
                                                        });
                                                } else {
                                                    uniR(res, false, 'Server is already being managed by OptimusCP !!')
                                                }
                                            })
                                            .catch(function(err) {
                                                uniR(res, false, 'Some error occurred when adding server, try again !!')
                                            });
                                    } else {
                                        uniR(res, false, 'The following OS is not supported: ' + result.stdout.split('\n')[0]);
                                    }
                                });
                        } else {
                            uniR(res, false, 'Only root user allowed !!');
                        }
                    });
            })
            .catch(function(err) {
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
            .then(function() {
                ssh.execCommand('sudo -n true')
                    .then(function(result) {
                        if (!result.stderr) {
                            ssh.execCommand('curl -O  https://optimuscp.io/bash/os.sh && chmod +x os.sh && ./os.sh && rm -f os.sh')
                                .then(function(result) {
                                    user.added.push({
                                        ip: req.body.ip,
                                        port: req.body.port,
                                        authType: req.body.authType,
                                        name: req.body.name,
                                        msgboard: {
                                            msg: 'Server is currently being configured !!',
                                            time: 1 * 60 * 1000
                                        },
                                        logs: [{
                                            msg: 'Server created'
                                        }],
                                        monitorLogs: [{
                                            isReachable: true
                                        }],
                                        'info.os': result.stdout.split('\n')[0],
                                        'info.hname': result.stdout.split('\n')[1]
                                    });
                                    user.logs.push({
                                        ip: requestIp.getClientIp(req),
                                        msg: 'Added Server with IP: ' + req.body.ip
                                    });
                                    if ((result.stdout.split('\n')[0].indexOf("CentOS") >= 0) || (result.stdout.split('\n')[0].indexOf("Ubuntu") >= 0)) {
                                        var oscmd = (result.stdout.split('\n')[0].indexOf("CentOS") >= 0) ? 'yum' : 'apt-get';
                                        ssh.execCommand('sudo -i /bin/bash -c "sudo useradd -m -ou 0 -g 0 -s /bin/bash optimusCP && echo -e \\"' + user.added[user.added.length - 1]._id + '\\n' + user.added[user.added.length - 1]._id + '\\" | sudo passwd optimusCP && echo \\"optimusCP ALL=(ALL:ALL) NOPASSWD: ALL\\" >> /etc/sudoers && service ssh restart && sudo sed -i \\"s/^PasswordAuthentication.*/PasswordAuthentication yes/\\" /etc/ssh/sshd_config && sudo sed -i \\"s/^PermitRootLogin.*/PermitRootLogin yes/\\" /etc/ssh/sshd_config && echo "\\nAllowUsers optimusCP\@optimuscp.io" >> /etc/ssh/sshd_config && service sshd reload"')
                                            .then(function(result) {
                                                fs.unlink(file, function(err) {});
                                                if (!result.stderr.includes('already exists')) {
                                                    ssh.connect({
                                                            host: req.body.ip,
                                                            port: req.body.port,
                                                            username: 'optimusCP',
                                                            password: String(user.added[user.added.length - 1]._id)
                                                        })
                                                        .then(function() {
                                                            ssh.execCommand('sudo ' + oscmd + ' -y install wget && wget -O metrics.sh https://optimuscp.io/bash/metrics.sh && chmod +x metrics.sh && sed -i "s/\x0D$//" metrics.sh && (crontab -l ; echo "*/5 * * * * /home/optimusCP/metrics.sh ' + user._id + ' ' + user.added[user.added.length - 1]._id + '") 2>&1 | grep -v "no crontab" | sort | uniq | crontab -')
                                                                .then(function(result) {
                                                                    console.log(result)
                                                                    user.save();
                                                                    uniR(res, true, 'Server added successfully !!');
                                                                });
                                                        })
                                                        .catch(function(err) {
                                                            uniR(res, false, 'Some error occurred when adding server, try again !!')
                                                        });
                                                } else {
                                                    uniR(res, false, 'Server is already being managed by OptimusCP !!')
                                                }
                                            });
                                    } else {
                                        uniR(res, false, 'The following OS is not supported: ' + result.stdout.split('\n')[0]);
                                    }
                                })
                                .catch(function(err) {
                                    uniR(res, false, 'Server is down / auth failed')
                                });
                        } else {
                            uniR(res, false, 'Only root user allowed !!');
                        }
                    })
                    .catch(function(err) {});
            })
            .catch(function(err) {
                uniR(res, false, 'Either server is down / Authentication failed');
            });
    }
};

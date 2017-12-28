module.exports = function(req, res, ssh, uniR, user) {
    function exec() {
        // ssh.connect({
        //         host: user.added[x].ip,
        //         port: user.added[x].port,
        //         username: 'optimusCP',
        //         password: String(user.added[x]._id)
        //     })
        //     .then(function() {
        //         uniR(res, true, msg)
        //         ssh.exec(cmd)
        //             .then(function(result) {
        //                 console.log(result);
        //             })
        //             .catch(function(err) {});
        //     })
        //     .catch(function(err) {
        //         uniR(res, false, 'Some error occurred !!');
        //     });var Client = require('ssh2').Client;
        var Connection = require('ssh2');
        var conn = new Connection();
        conn.on('ready', function() {
                conn.exec(cmd, function(err, stream) {
                    if (err) console.log(err);
                    stream.on('exit', function(code, signal) {
                        console.log('Stream :: exit :: code: ' + code + ', signal: ' + signal);
                    });
                    stream.on('close', function() {
                        console.log('Stream :: close');
                        conn.end();
                    });
                    stream.on('data', function(data) {
                        console.log(data.toString('utf8'))
                        if (data.indexOf('update-finished') >= 0)
                            uniR(res, true, msg)
                    });
                    stream.stderr.on('data', function(data) {
                        console.log('STDERR: ' + data);
                        if (data.indexOf('optimusCP') >= 0)
                            uniR(res, false, 'user already exists')
                    });
                });
            })
            .on('error', function (err) {
                console.log(err);
                uniR(res, false, 'Authentication failed !!')
            })
            .connect({
                debug: function(s) {
                    console.log(new Date().toTimeString() + ' ' + s);
                },
                host: user.added[x].ip,
                port: user.added[x].port,
                username: 'optimusCP',
                password: String(user.added[x]._id)
            });
    }
    if ((x = user.added.findIndex(x => x._id == req.body.serverId)) >= 0) {
        var cmd = '',
            msg = '';
        switch (req.body.cmd) {
            case 1:
                cmd = 'useradd optimusCP';
                msg = 'Restarted successfully !!';
                user.added[x].logs.push({
                    msg: 'Restarted server'
                });
                user.added[x].msgboard = {
                    msg: 'System is rebooting !!',
                    time: 1 * 30 * 1000,
                    date: Date.now()
                };
                user.save();
                exec();
                break;
            case 2:
                cmd = 'sudo hostnamectl set-hostname ' + req.body.hname;
                user.added[x].info.hname = req.body.hname;
                user.added[x].logs.push({
                    msg: 'Changed hostname to ' + req.body.hname
                });
                user.save();
                msg = 'Hostname changed successfully !!';
                exec();
                break;
            case 3:
                var oscmd = (user.added[x].info.os.indexOf("CentOS") >= 0) ? 'yum' : 'apt-get';
                cmd = 'sudo ' + oscmd + ' update && sudo ' + oscmd + ' -y upgrade'
                msg = 'System will be updated !!';
                user.added[x].logs.push({
                    msg: 'Updated server'
                });
                user.added[x].msgboard = {
                    msg: 'System is being updated !!',
                    time: 1 * 60 * 1000,
                    date: Date.now()
                };
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
};

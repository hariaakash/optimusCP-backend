module.exports = function(req, res, ssh, uniR, user) {
    function exec() {
        ssh.connect({
                host: user.added[x].ip,
                port: user.added[x].port,
                username: 'optimusCP',
                password: String(user.added[x]._id)
            })
            .then(function() {
                uniR(res, true, msg)
                ssh.exec(cmd)
                    .then(function(result) {})
                    .catch(function(err) {});
            })
            .catch(function(err) {
                uniR(res, false, 'Some error occurred !!');
            });
    }
    if ((x = user.added.findIndex(x => x._id == req.body.serverId)) >= 0) {
        var cmd = '',
            msg = '';
        switch (req.body.cmd) {
            case 1:
                cmd = 'sudo reboot';
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
                cmd = 'sudo hostnamectl set-hostname ' + req.body.hname
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

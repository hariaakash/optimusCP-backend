module.exports = function(req, res, ssh, requestIp, uniR, user, team) {
    function exec() {
        ssh.connect({
                host: team.added[x].ip,
                port: team.added[x].port,
                username: 'optimusCP',
                password: String(team.added[x]._id)
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
    if ((x = team.added.findIndex(x => x._id == req.body.serverId)) >= 0) {
        var cmd = '',
            msg = '';
        switch (req.body.cmd) {
            case 1:
                cmd = 'sudo reboot';
                msg = 'Restarted successfully !!';
                team.added[x].logs.push({
                    ip: requestIp.getClientIp(req),
                    msg: 'Restarted server',
                    user: user.email
                });
                team.added[x].msgboard = {
                    msg: 'System is rebooting !!',
                    time: 1 * 30 * 1000,
                    date: Date.now()
                };
                team.save();
                exec();
                break;
            case 2:
                cmd = 'sudo hostnamectl set-hostname ' + req.body.hname
                team.added[x].info.hname = req.body.hname;
                team.added[x].logs.push({
                    ip: requestIp.getClientIp(req),
                    msg: 'Changed hostname to ' + req.body.hname,
                    user: user.email
                });
                team.save();
                msg = 'Hostname changed successfully !!';
                exec();
                break;
            case 3:
                var oscmd = (team.added[x].info.os.indexOf("CentOS") >= 0) ? 'yum' : 'apt-get';
                cmd = 'sudo ' + oscmd + ' update && sudo ' + oscmd + ' -y upgrade'
                msg = 'System will be updated !!';
                team.added[x].logs.push({
                    ip: requestIp.getClientIp(req),
                    msg: 'Updated server',
                    user: user.email
                });
                team.added[x].msgboard = {
                    msg: 'System is being updated !!',
                    time: 1 * 60 * 1000,
                    date: Date.now()
                };
                team.save();
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

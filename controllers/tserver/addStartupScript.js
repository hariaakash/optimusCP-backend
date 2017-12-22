module.exports = function(req, res, ssh, requestIp, uniR, user, team) {
    if ((i = team.added.findIndex(x => x._id == req.body.serverId)) >= 0) {
        team.added[i].startupScripts.push({
            cmd: req.body.cmd
        });
        team.added[i].logs.push({
            ip: requestIp.getClientIp(req),
            msg: 'Added startup script with command: ' + req.body.cmd,
            user: user.email
        });
        ssh.connect({
                host: team.added[i].ip,
                port: team.added[i].port,
                username: 'optimusCP',
                password: String(team.added[i]._id)
            })
            .then(function() {
                ssh.execCommand('(crontab -l ; echo "@reboot ' + req.body.cmd + '") 2>&1 |  crontab -')
                    .then(function(result) {
                        team.save();
                        uniR(res, true, 'Startup Script Added Successfully');
                    });
            })
            .catch(function(err) {
                uniR(res, false, 'Session Timed out / Server is down !!')
            });
    } else {
        uniR(res, false, 'Server not found !!');
    }
};

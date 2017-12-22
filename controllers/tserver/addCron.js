module.exports = function(req, res, ssh, requestIp, uniR, user, team) {
    if ((i = team.added.findIndex(x => x._id == req.body.serverId)) >= 0) {
        team.added[i].crons.push({
            cmd: req.body.cmd,
            exp: req.body.exp
        });
        team.added[i].logs.push({
            ip: requestIp.getClientIp(req),
            msg: 'Added cron with command: ' + req.body.cmd,
            user: user.email
        });
        ssh.connect({
                host: team.added[i].ip,
                port: team.added[i].port,
                username: 'optimusCP',
                password: String(team.added[i]._id)
            })
            .then(function() {
                var cmd = '(crontab -l ; echo "' + req.body.exp + ' ' + req.body.cmd + '") 2>&1 |  crontab -';
                ssh.execCommand(cmd)
                    .then(function(result) {
                        team.save()
                            .then(function(team) {
                                uniR(res, true, 'Cron Added Successfully');
                            })
                            .catch(function(err) {
                                uniR(res, false, 'Error adding cron !!')
                            });
                    });
            })
            .catch(function(err) {
                uniR(res, false, 'Session Timed out / Server is down !!')
            });
    } else {
        uniR(res, false, 'Server not found !!');
    }
};

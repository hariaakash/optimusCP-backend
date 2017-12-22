module.exports = function(req, res, ssh, requestIp, uniR, user, team) {
    if ((i = team.added.findIndex(x => x._id == req.body.serverId)) >= 0) {
        if ((j = team.added[i].crons.findIndex(x => x._id == req.body.cronId)) >= 0) {
            var cmd = 'crontab -l | grep -v "' + team.added[i].crons[j].cmd + '" | crontab -';
            team.added[i].logs.push({
                ip: requestIp.getClientIp(req),
                msg: 'Removed cron with command: ' + team.added[i].crons[j].cmd,
                user: user.email
            });
            team.added[i].crons = team.added[i].crons.filter(function(cron) {
                return cron._id != req.body.cronId;
            });
            ssh.connect({
                    host: team.added[i].ip,
                    port: team.added[i].port,
                    username: 'optimusCP',
                    password: String(team.added[i]._id)
                })
                .then(function() {
                    ssh.execCommand(cmd)
                        .then(function(result) {
                            team.save();
                            uniR(res, true, 'Cron Removed Successfully');
                        });
                })
                .catch(function(err) {
                    uniR(res, false, 'Session Timed out / Server is down !!')
                });
        } else {
            uniR(res, false, 'Cron not found !!');
        }
    } else {
        uniR(res, false, 'Server not found !!');
    }
};

module.exports = function(req, res, ssh, requestIp, uniR, user, team) {
    if ((i = team.added.findIndex(x => x._id == req.body.serverId)) >= 0) {
        if ((j = team.added[i].startupScripts.findIndex(x => x._id == req.body.startupScriptId)) >= 0) {
            var cmd = 'crontab -l | grep -v "' + team.added[i].startupScripts[j].cmd + '" | crontab -';
            team.added[i].logs.push({
                ip: requestIp.getClientIp(req),
                msg: 'Removed startup script with command: ' + team.added[i].startupScripts[j].cmd,
                user: user.email
            });
            team.added[i].startupScripts = team.added[i].startupScripts.filter(function(startupScript) {
                return startupScript._id != req.body.startupScriptId;
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
                            uniR(res, true, 'Startup Script Removed Successfully');
                        });
                })
                .catch(function(err) {
                    uniR(res, false, 'Session Timed out / Server is down !!')
                });
        } else {
            uniR(res, false, 'Startup Script not found !!');
        }
    } else {
        uniR(res, false, 'Server not found !!')
    }
};

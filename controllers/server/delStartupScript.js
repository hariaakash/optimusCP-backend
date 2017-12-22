module.exports = function(req, res, ssh, uniR, user) {
    if ((i = user.added.findIndex(x => x._id == req.body.serverId)) >= 0) {
        if ((j = user.added[i].startupScripts.findIndex(x => x._id == req.body.startupScriptId)) >= 0) {
            var cmd = 'crontab -l | grep -v "' + user.added[i].startupScripts[j].cmd + '" | crontab -';
            user.added[i].logs.push({
                msg: 'Removed startup script with command: ' + user.added[i].startupScripts[j].cmd
            });
            user.added[i].startupScripts = user.added[i].startupScripts.filter(function(startupScript) {
                return startupScript._id != req.body.startupScriptId;
            });
            ssh.connect({
                    host: user.added[i].ip,
                    port: user.added[i].port,
                    username: 'optimusCP',
                    password: String(user.added[i]._id)
                })
                .then(function() {
                    ssh.execCommand(cmd)
                        .then(function(result) {
                            user.save();
                            uniR(res, true, 'Startup Script Removed Successfully');
                        });
                })
                .catch(function(err) {
                    uniR(res, false, 'Some error occurred !!');
                });
        } else {
            uniR(res, false, 'Startup Script not found !!');
        }
    } else {
        uniR(res, false, 'Server not found !!');
    }
};

module.exports = function(req, res, ssh, uniR, user) {
    if ((i = user.added.findIndex(x => x._id == req.body.serverId)) >= 0) {
        if ((j = user.added[i].crons.findIndex(x => x._id == req.body.cronId)) >= 0) {
            var cmd = 'crontab -l | grep -v "' + user.added[i].crons[j].cmd + '" | crontab -';
            user.added[i].logs.push({
                msg: 'Removed cron with command: ' + user.added[i].crons[j].cmd
            });
            user.added[i].crons = user.added[i].crons.filter(function(cron) {
                return cron._id != req.body.cronId;
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
                            uniR(res, true, 'Cron Removed Successfully');
                        });
                })
                .catch(function(err) {
                    uniR(res, false, 'Some error occurred !!');
                });
        } else {
            uniR(res, false, 'Cronjob not found !!')
        }
    } else {
        uniR(res, false, 'Server not found !!');
    }
};

module.exports = function(req, res, ssh, uniR, user) {
    if ((i = user.added.findIndex(x => x._id == req.body.serverId)) >= 0) {
        user.added[i].crons.push({
            cmd: req.body.cmd,
            exp: req.body.exp
        });
        user.added[i].logs.push({
            msg: 'Added cron with command: ' + req.body.cmd
        });
        ssh.connect({
                host: user.added[i].ip,
                port: user.added[i].port,
                username: 'optimusCP',
                password: String(user.added[i]._id)
            })
            .then(function() {
                var cmd = '(crontab -l ; echo "' + req.body.exp + ' ' + req.body.cmd + '") 2>&1 |  crontab -';
                ssh.execCommand(cmd)
                    .then(function(result) {
                        user.save()
                            .then(function(user) {
                                uniR(res, true, 'Cron Added Successfully');
                            })
                            .catch(function(err) {
                                uniR(res, false, 'Error adding cron !!')
                            });
                    });
            })
            .catch(function(err) {
                uniR(res, false, 'Some error occurred !!');
            });
    } else {
        uniR(res, false, 'Server not found !!');
    }
};

module.exports = function(req, res, ssh, uniR, user) {
    if ((i = user.added.findIndex(x => x._id == req.body.serverId)) >= 0) {
        user.added[i].startupScripts.push({
            cmd: req.body.cmd
        });
        user.added[i].logs.push({
            msg: 'Added startup script with command: ' + req.body.cmd
        });
        ssh.connect({
                host: user.added[i].ip,
                port: user.added[i].port,
                username: 'optimusCP',
                password: String(user.added[i]._id)
            })
            .then(function() {
                ssh.execCommand('(crontab -l ; echo "@reboot ' + req.body.cmd + '") 2>&1 |  crontab -')
                    .then(function(result) {
                        user.save();
                        uniR(res, true, 'Startup Script Added Successfully');
                    });
            })
            .catch(function(err) {
                uniR(res, false, 'Some error occurred !!');
            });
    } else {
        uniR(res, false, 'Server not found !!');
    }
};

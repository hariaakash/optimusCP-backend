module.exports = function(req, res, requestIp, uniR, user, team) {
    if ((i = team.added.findIndex(x => x._id == req.body.serverId)) >= 0) {
        var msg = '';
        if (req.body.type == 1) {
            msg = 'CPU';
            team.added[i].alerts.cpu = {
                interval: req.body.interval,
                val: req.body.val,
                enabled: true,
                current: Date.now()
            };
        } else if (req.body.type == 2) {
            msg = 'RAM';
            team.added[i].alerts.m = {
                interval: req.body.interval,
                val: req.body.val,
                enabled: true,
                current: Date.now()
            };
        } else {
            msg = 'ROM';
            team.added[i].alerts.d = {
                interval: req.body.interval,
                val: req.body.val,
                enabled: true,
                current: Date.now()
            };
        }
        team.added[i].logs.push({
            ip: requestIp.getClientIp(req),
            msg: 'Enabled alert for ' + msg + ' usage.',
            user: user.email
        });
        team.save();
        uniR(res, true, 'Alert enabled successfully!');
    } else {
        uniR(res, false, 'Server not found !!');
    }
};

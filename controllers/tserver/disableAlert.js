module.exports = function(req, res, requestIp, uniR, user, team) {
    if ((i = team.added.findIndex(x => x._id == req.body.serverId)) >= 0) {
        if (req.body.type == 1) {
            msg = 'CPU';
            team.added[i].alerts.cpu.enabled = false;
        } else if (req.body.type == 2) {
            msg = 'ROM';
            team.added[i].alerts.m.enabled = false;
        } else if (req.body.type == 3) {
            msg = 'ROM';
            team.added[i].alerts.d.enabled = false;
        }
        team.added[i].logs.push({
            ip: requestIp.getClientIp(req),
            msg: 'Disabled alert for ' + msg + ' usage.',
            user: user.email
        });
        team.save();
        uniR(res, true, 'Alert disabled successfully!');
    } else {
        uniR(res, false, 'Server not found !!');
    }
};

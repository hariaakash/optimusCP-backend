module.exports = function(req, res, uniR, user) {
    if ((i = user.added.findIndex(x => x._id == req.body.serverId)) >= 0) {
        if (req.body.type == 1) {
            msg = 'CPU';
            user.added[i].alerts.cpu.enabled = false;
        } else if (req.body.type == 2) {
            msg = 'ROM';
            user.added[i].alerts.m.enabled = false;
        } else if (req.body.type == 3) {
            msg = 'ROM';
            user.added[i].alerts.d.enabled = false;
        }
        user.added[i].logs.push({
            msg: 'Disabled alert for ' + msg + ' usage.'
        });
        user.save();
        uniR(res, true, 'Alert disabled successfully!');
    } else {
        uniR(res, false, 'Server not found !!');
    }
};

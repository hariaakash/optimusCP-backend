module.exports = function(req, res, uniR, user) {
    if ((i = user.added.findIndex(x => x._id == req.body.serverId)) >= 0) {
        var msg = '';
        if (req.body.type == 1) {
            msg = 'CPU';
            user.added[i].alerts.cpu = {
                interval: req.body.interval,
                val: req.body.val,
                enabled: true,
                current: Date.now()
            };
        } else if (req.body.type == 2) {
            msg = 'RAM';
            user.added[i].alerts.m = {
                interval: req.body.interval,
                val: req.body.val,
                enabled: true,
                current: Date.now()
            };
        } else {
            msg = 'ROM';
            user.added[i].alerts.d = {
                interval: req.body.interval,
                val: req.body.val,
                enabled: true,
                current: Date.now()
            };
        }
        user.added[i].logs.push({
            msg: 'Enabled alert for ' + msg + ' usage.'
        });
        user.save();
        uniR(res, true, 'Alert enabled successfully!');
    } else {
        uniR(res, false, 'Server not found !!');
    }
};

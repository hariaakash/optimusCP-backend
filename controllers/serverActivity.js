module.exports = function(req, res, uniR, added, flag) {
    var server = added.filter(function(x) {
        return x._id == req.query.serverId;
    });
    if (server[0]) {
        var logs = [];
        server[0].logs = server[0].logs.reverse().slice(0, 100);
        if (flag == 1)
            for (i = 0; i < server[0].logs.length; i++)
                logs.push({
                    x: i,
                    msg: server[0].logs[i].msg,
                    date: server[0].logs[i].date
                })
        else if (flag == 2)
            for (i = 0; i < server[0].logs.length; i++)
                logs.push({
                    x: i,
                    msg: server[0].logs[i].msg,
                    user: server[0].logs[i].user,
                    date: server[0].logs[i].date
                })
        res.json({
            status: true,
            data: logs
        })
    } else {
        uniR(res, false, 'Server not found !!')
    }
};

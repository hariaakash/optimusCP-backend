function timeConversion(millisec) {
    var seconds = (millisec / 1000).toFixed(1);
    var minutes = (millisec / (1000 * 60)).toFixed(1);
    var hours = (millisec / (1000 * 60 * 60)).toFixed(1);
    var days = (millisec / (1000 * 60 * 60 * 24)).toFixed(1);
    if (seconds < 60) {
        return seconds + " Sec";
    } else if (minutes < 60) {
        return minutes + " Min";
    } else if (hours < 24) {
        return hours + " Hrs";
    } else {
        return days + " Days"
    }
}
module.exports = function(req, res, uniR, added) {
    var server = added.filter(function(x) {
        return x._id == req.query.serverId;
    });
    if (server[0]) {
        var logs = [];
        server[0].monitorLogs = server[0].monitorLogs.reverse().slice(0,8640);
        for (i = 0; i < server[0].monitorLogs.length; i++)
            logs.push({
                no: i,
                isReachable: server[0].monitorLogs[i].isReachable,
                start: server[0].monitorLogs[i].start,
                current: server[0].monitorLogs[i].current,
                duration: timeConversion(server[0].monitorLogs[i].current - server[0].monitorLogs[i].start)
            })
        res.json({
            status: true,
            data: logs
        })
    } else {
        uniR(res, false, 'Server not found !!')
    }
};

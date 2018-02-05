module.exports = function(req, res, uniR, formatBytes, moment, uniR, user, team) {
    var server = team.added.filter(function(server) {
        return server._id == req.query.serverId;
    });
    if (server[0]) {
        var metrics = server[0].metrics;
        var latest = [],
            d = [],
            m = [],
            seriesOptions = [];
        if (metrics > 8640)
            metrics = metrics.slice().reverse().slice(0, 8640).reverse();
        for (i = 0; i < metrics.length; i++) {
            d.push([moment(metrics[i].date).valueOf(), parseFloat((metrics[i].d_u * 100 / metrics[i].d_t).toFixed(2))]);
            m.push([moment(metrics[i].date).valueOf(), parseFloat((metrics[i].m_u * 100 / metrics[i].m_t).toFixed(2))]);
        }
        latest.push({
            cpu: metrics[metrics.length - 1].cpu,
            m: (metrics[metrics.length - 1].m_u * 100 / metrics[metrics.length - 1].m_t).toFixed(2),
            d: (metrics[metrics.length - 1].d_u * 100 / metrics[metrics.length - 1].d_t).toFixed(2)
        });
        seriesOptions.push({
            name: 'Memory',
            compare: 'percent',
            data: m,
            gapSize: 5,
            type: 'area'
        }, {
            name: 'Disk',
            compare: 'percent',
            gapSize: 5,
            data: d,
            type: 'area'
        });
        res.json({
            status: true,
            data: {
                id: String(server[0]._id),
                ip: server[0].ip,
                port: server[0].port,
                name: server[0].name,
                msgboard: server[0].msgboard,
                info: server[0].info,
                metrics: latest[0],
                seriesOptions: seriesOptions,
                crons: server[0].crons,
                startupScripts: server[0].startupScripts,
                alerts: server[0].alerts,
                monitorLogs: server[0].monitorLogs[server[0].monitorLogs.length - 1]
            }
        });
    } else {
        uniR(res, false, 'Server not found !!')
    }
};

module.exports = function(req, res, formatBytes, uniR, user) {
    var server = user.added.filter(function(server) {
        return server._id == req.query.serverId;
    });
    if (server[0]) {
        var metrics = server[0].metrics;
        var latest = [],
            d = [],
            m = [],
            seriesOptions = [];
        for (i = 0; i < metrics.length; i++) {
            latest.push({
                date: metrics[i].date,
                d_u: formatBytes(metrics[i].d_u),
                d_t: formatBytes(metrics[i].d_t),
                m_u: formatBytes(metrics[i].m_u),
                m_t: formatBytes(metrics[i].m_t),
                m: (metrics[i].m_u * 100 / metrics[i].m_t).toFixed(2),
                d: (metrics[i].d_u * 100 / metrics[i].d_t).toFixed(2)
            });
            d.push([moment(metrics[i].date).valueOf(), parseFloat((metrics[i].d_u * 100 / metrics[i].d_t).toFixed(2))]);
            m.push([moment(metrics[i].date).valueOf(), parseFloat((metrics[i].m_u * 100 / metrics[i].m_t).toFixed(2))]);
        }
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
                metrics: latest[latest.length - 1],
                seriesOptions: seriesOptions,
                crons: server[0].crons,
                startupScripts: server[0].startupScripts,
                monitorLogs: server[0].monitorLogs[server[0].monitorLogs.length - 1]
            }
        });
    } else {
        uniR(res, false, 'Server not found !!')
    }
};

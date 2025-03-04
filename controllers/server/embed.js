module.exports = function(req, res, moment, user) {
    var server = user.added.filter(function(server) {
        return server._id == req.query.serverId;
    });
    var metrics = server[0].metrics;
    var d = [],
        m = [],
        cpu = [],
        seriesOptions = [];
    if (metrics > 8640)
        metrics = metrics.slice().reverse().slice(0, 8640).reverse();
    for (i = 0; i < metrics.length; i++) {
        d.push([moment(metrics[i].date).valueOf(), parseFloat((metrics[i].d_u * 100 / metrics[i].d_t).toFixed(2))]);
        m.push([moment(metrics[i].date).valueOf(), parseFloat((metrics[i].m_u * 100 / metrics[i].m_t).toFixed(2))]);
        cpu.push([moment(metrics[i].date).valueOf(), metrics[i].cpu]);
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
    }, {
        name: 'CPU',
        compare: 'percent',
        gapSize: 5,
        data: cpu,
        type: 'area'
    });
    res.json({
        status: true,
        data: {
            ip: server[0].ip,
            seriesOptions: seriesOptions
        }
    });
};

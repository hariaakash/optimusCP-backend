module.exports = function(res, status, msg) {
    res.json({
        status: status,
        msg: msg
    });
};

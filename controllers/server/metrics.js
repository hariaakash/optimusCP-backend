var sg = require('sendgrid')('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');
var url = 'https://optimuscp.io/dashboard/#!/';
module.exports = function(req, res, uniR, user) {
    if ((i = user.added.findIndex(x => x._id == req.params.serverId)) >= 0) {
        var c = 0,
            msg = '';
        if (user.added[i].alerts.cpu.enabled && user.added[i].alerts.val <= req.body.cpu)
            if (Date.now() - user.added[i].alerts.cpu.current >= user.added[i].alerts.cpu.interval) {
                msg = 'CPU';
                c++;
                user.added[i].alerts.cpu.current = Date.now();
            }
        if (user.added[i].alerts.m.enabled && user.added[i].alerts.m.val <= (req.body.m_u / req.body.m_t) * 100)
            if (Date.now() - user.added[i].alerts.m.current >= user.added[i].alerts.m.interval) {
                if (c > 0)
                    msg += ', RAM';
                else
                    msg = 'RAM';
                c++;
                user.added[i].alerts.m.current = Date.now();
            }
        if (user.added[i].alerts.d.enabled && user.added[i].alerts.d.val <= (req.body.d_u / req.body.d_t) * 100)
            if (Date.now() - user.added[i].alerts.d.current >= user.added[i].alerts.d.interval) {
                if (c > 0)
                    msg += ', ROM';
                else
                    msg = 'ROM';
                msg = '';
                c++;
                user.added[i].alerts.d.current = Date.now();
            }
        if (c > 0) {
            var helper = require('sendgrid').mail;
            var from = new helper.Email('support@optimuscp.io', 'OptimusCP');
            var to = new helper.Email(user.email);
            var subject = 'Server ' + user.added[i].name + ' - Alerts [OptimusCP]';
            var body = new helper.Content('text/html', 'Welcome to OptimusCP');
            var mail = new helper.Mail(from, subject, to, body);
            mail.personalizations[0].addSubstitution(new helper.Substitution('-email-', user.email));
            mail.personalizations[0].addSubstitution(new helper.Substitution('-url-', url));
            mail.personalizations[0].addSubstitution(new helper.Substitution('-body-', 'Server Alerts'));
            mail.personalizations[0].addSubstitution(new helper.Substitution('-msg1-', 'Server ' + user.added[i].name + ' (' + user.added[i].ip + ') usage has exceeded the limits set for ' + msg + ' .'));
            mail.personalizations[0].addSubstitution(new helper.Substitution('-msg1-', ' '));
            mail.setTemplateId('d737b3b2-539b-4953-9bb1-57e5f23efe63');
            var request = sg.emptyRequest({
                method: 'POST',
                path: '/v3/mail/send',
                body: mail.toJSON(),
            });
            sg.API(request);
        }
        user.added[i].metrics.push({
            m_t: req.body.m_t,
            m_u: req.body.m_u,
            d_t: req.body.d_t,
            d_u: req.body.d_u,
            cpu: req.body.cpu,
            m: parseFloat((req.body.m_u * 100 / req.body.m_t).toFixed(2)),
            d: parseFloat((req.body.d_u * 100 / req.body.d_t).toFixed(2))
        });
        user.save();
        uniR(res, true, 'Metrics received !!');
    } else {
        uniR(res, false, 'Server not found !!');
    }
};
